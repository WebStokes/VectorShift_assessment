import json
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.llm_router import (
    route_prompt,
    compare_models,
)
from services.graph_executor import execute_workflow


class AIRequest(BaseModel):
    query: str
    mode: str = "auto"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PipelineRequest(BaseModel):
    nodes: List[dict]
    edges: List[dict]


class WorkflowSaveRequest(PipelineRequest):
    name: str


DATA_DIR = Path(__file__).parent / "data"
WORKFLOW_DIR = DATA_DIR / "workflows"
HISTORY_FILE = DATA_DIR / "execution_history.json"


def ensure_data_dir():
    WORKFLOW_DIR.mkdir(parents=True, exist_ok=True)
    if not HISTORY_FILE.exists():
        HISTORY_FILE.write_text("[]", encoding="utf-8")


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


def is_dag(nodes, edges):
    graph = {}

    for node in nodes:
        graph[node["id"]] = []

    for edge in edges:
        source = edge["source"]
        target = edge["target"]

        if source in graph:
            graph[source].append(target)

    visited = set()
    recursion_stack = set()

    def dfs(node):
        if node in recursion_stack:
            return False

        if node in visited:
            return True

        visited.add(node)
        recursion_stack.add(node)

        for neighbour in graph[node]:
            if not dfs(neighbour):
                return False

        recursion_stack.remove(node)

        return True

    for node in graph:
        if node not in visited:
            if not dfs(node):
                return False

    return True


@app.post("/pipelines/parse")
def parse_pipeline(data: PipelineRequest):

    num_nodes = len(data.nodes)

    num_edges = len(data.edges)

    dag_result = is_dag(
        data.nodes,
        data.edges
    )

    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": dag_result,
    }


@app.post("/workflows/execute")
def execute_workflow_route(data: PipelineRequest):
    try:
        result = execute_workflow(data.nodes, data.edges)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    ensure_data_dir()
    history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    history.insert(
        0,
        {
            "execution_id": result["execution_id"],
            "status": result["status"],
            "node_count": len(data.nodes),
            "edge_count": len(data.edges),
            "duration_ms": result["duration_ms"],
        },
    )
    HISTORY_FILE.write_text(json.dumps(history[:50], indent=2), encoding="utf-8")
    return result


@app.post("/workflows/save")
def save_workflow(data: WorkflowSaveRequest):
    ensure_data_dir()
    safe_name = "".join(char for char in data.name if char.isalnum() or char in ("-", "_")).strip()
    if not safe_name:
        raise HTTPException(status_code=400, detail="Workflow name is required")
    path = WORKFLOW_DIR / f"{safe_name}.json"
    payload = {"name": data.name, "nodes": data.nodes, "edges": data.edges}
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return {"name": data.name, "path": str(path), "saved": True}


@app.get("/workflows")
def list_workflows():
    ensure_data_dir()
    return {
        "workflows": [
            path.stem
            for path in WORKFLOW_DIR.glob("*.json")
        ]
    }


@app.get("/workflows/{name}")
def load_workflow(name: str):
    ensure_data_dir()
    path = WORKFLOW_DIR / f"{name}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Workflow not found")
    return json.loads(path.read_text(encoding="utf-8"))


@app.get("/executions/history")
def execution_history(limit: Optional[int] = 20):
    ensure_data_dir()
    history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    return {"history": history[:limit]}

@app.post("/ai/generate")
def generate_ai_response(
    request: AIRequest
):

    if request.mode == "compare":

        return compare_models(
            request.query
        )

    return route_prompt(
        request.query,
        request.mode,
    )
