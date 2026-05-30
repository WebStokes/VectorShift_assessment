from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

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