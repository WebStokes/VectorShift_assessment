import time
import uuid
from collections import deque
from typing import Any, Dict, List

from services.node_executor import NodeContext, execute_node


def build_graph(nodes, edges):
    graph = {node["id"]: [] for node in nodes}
    incoming = {node["id"]: [] for node in nodes}

    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        if source not in graph or target not in incoming:
            raise ValueError(f"Edge references an unknown node: {source} -> {target}")
        graph[source].append(target)
        incoming[target].append(source)

    return graph, incoming


def topological_sort(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> List[str]:
    graph, incoming = build_graph(nodes, edges)
    in_degree = {node_id: len(sources) for node_id, sources in incoming.items()}
    ready = deque([node["id"] for node in nodes if in_degree[node["id"]] == 0])
    order = []

    while ready:
        node_id = ready.popleft()
        order.append(node_id)
        for target in graph[node_id]:
            in_degree[target] -= 1
            if in_degree[target] == 0:
                ready.append(target)

    if len(order) != len(nodes):
        raise ValueError("Workflow must be a DAG. A cycle was detected.")

    return order


def execute_workflow(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
    node_by_id = {node["id"]: node for node in nodes}
    graph, incoming = build_graph(nodes, edges)
    order = topological_sort(nodes, edges)
    execution_id = str(uuid.uuid4())
    started_at = time.time()
    node_outputs: Dict[str, Dict[str, Any]] = {}
    statuses = {
        node["id"]: {
            "status": "pending",
            "node_type": node.get("type"),
            "label": node.get("data", {}).get("label") or node.get("type"),
        }
        for node in nodes
    }
    logs = []

    for node_id in order:
        node = node_by_id[node_id]
        statuses[node_id]["status"] = "running"
        node_started = time.perf_counter()
        inputs = {}
        for source_id in incoming[node_id]:
            source_output = node_outputs.get(source_id, {})
            inputs[source_id] = source_output.get("result", source_output)
            inputs.update(source_output)

        context = NodeContext(
            node=node,
            inputs=inputs,
            outputs=node_outputs,
            metadata={
                "execution_id": execution_id,
                "node_id": node_id,
                "upstream": incoming[node_id],
                "downstream": graph[node_id],
            },
        )

        try:
            result = execute_node(context)
            node_outputs[node_id] = result
            statuses[node_id].update(
                {
                    "status": "success",
                    "result": result.get("result"),
                    "duration_ms": round((time.perf_counter() - node_started) * 1000, 2),
                }
            )
            logs.append(
                {
                    "node_id": node_id,
                    "status": "success",
                    "message": f"Executed {node.get('type')}",
                }
            )
        except Exception as exc:
            statuses[node_id].update(
                {
                    "status": "failed",
                    "error": str(exc),
                    "duration_ms": round((time.perf_counter() - node_started) * 1000, 2),
                }
            )
            logs.append({"node_id": node_id, "status": "failed", "message": str(exc)})
            return {
                "execution_id": execution_id,
                "status": "failed",
                "order": order,
                "node_outputs": node_outputs,
                "node_statuses": statuses,
                "logs": logs,
                "duration_ms": round((time.time() - started_at) * 1000, 2),
            }

    output_nodes = [
        node["id"]
        for node in nodes
        if node.get("type") in {"customOutput", "output"}
    ]
    final_outputs = {
        node_id: node_outputs.get(node_id, {}).get("result")
        for node_id in output_nodes
    }
    return {
        "execution_id": execution_id,
        "status": "success",
        "order": order,
        "node_outputs": node_outputs,
        "node_statuses": statuses,
        "logs": logs,
        "final_outputs": final_outputs,
        "duration_ms": round((time.time() - started_at) * 1000, 2),
    }
