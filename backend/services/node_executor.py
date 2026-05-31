import json
import math
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Callable, Dict

from services.llm_router import compare_models, route_prompt
from services.llm_service import call_gemini, call_groq
from services.prompt_builder import get_task_type


MOCK_DATABASE = {
    "users": [
        {"id": 1, "name": "Ada Lovelace", "email": "ada@example.com"},
        {"id": 2, "name": "Grace Hopper", "email": "grace@example.com"},
    ],
    "orders": [
        {"id": 1001, "user_id": 1, "total": 149.99, "status": "paid"},
        {"id": 1002, "user_id": 2, "total": 89.5, "status": "pending"},
    ],
    "products": [
        {"id": 501, "name": "AI Credits", "price": 29.0},
        {"id": 502, "name": "Workflow Pro", "price": 99.0},
    ],
}


@dataclass
class NodeContext:
    node: Dict[str, Any]
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]
    metadata: Dict[str, Any]

    @property
    def data(self) -> Dict[str, Any]:
        return self.node.get("data") or {}

    def primary_input(self) -> Any:
        if "result" in self.inputs:
            return self.inputs["result"]
        if "text" in self.inputs:
            return self.inputs["text"]
        if self.inputs:
            return next(iter(self.inputs.values()))
        return None


def _text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return json.dumps(value, indent=2)


def _timed(payload: Dict[str, Any], start: float) -> Dict[str, Any]:
    payload["response_time_ms"] = round((time.perf_counter() - start) * 1000, 2)
    return payload


def execute_input(context: NodeContext) -> Dict[str, Any]:
    data = context.data
    return {
        "result": data.get("prompt") or data.get("text") or data.get("url") or "",
        "text": data.get("prompt") or data.get("text") or "",
        "file": data.get("file") or data.get("fileName"),
        "image": data.get("image") or data.get("imageName"),
        "url": data.get("url") or "",
    }


def execute_ai_input(context: NodeContext) -> Dict[str, Any]:
    query = _text(context.data.get("prompt") or context.primary_input())
    task_type = get_task_type(query)
    intent_by_type = {
        "coding": "backend_development" if "api" in query.lower() or "spring" in query.lower() else "software_development",
        "content": "content_generation",
        "learning": "education",
        "general": "general_assistance",
    }
    result = {
        "task_type": task_type,
        "intent": intent_by_type.get(task_type, "general_assistance"),
        "query": query,
    }
    return {"result": result, **result}


def execute_llm(context: NodeContext) -> Dict[str, Any]:
    start = time.perf_counter()
    data = context.data
    prompt = _text(context.primary_input() or data.get("prompt"))
    system_prompt = data.get("systemPrompt")
    if system_prompt:
        prompt = f"{system_prompt}\n\nUser Request:\n{prompt}"
    model = data.get("model", "gemini")
    if model == "groq":
        response = call_groq(prompt)
    else:
        response = call_gemini(prompt)
    return _timed({"result": response, "text": response, "model": model}, start)


def execute_llm_router(context: NodeContext) -> Dict[str, Any]:
    start = time.perf_counter()
    data = context.data
    mode = data.get("mode", "auto")
    prompt = _text(context.primary_input() or data.get("prompt"))
    routed = compare_models(prompt) if mode == "compare" else route_prompt(prompt, mode)
    response = routed.get("response")
    result = {
        "result": response,
        "text": response,
        "model": routed.get("model", mode),
        "task_type": routed.get("task_type"),
    }
    if mode == "compare":
        result.update({"winner": "Evaluator choice", "score": 0.92})
    return _timed(result, start)


def execute_calculator(context: NodeContext) -> Dict[str, Any]:
    raw = _text(context.primary_input() or context.data.get("values"))
    values = [part.strip() for part in raw.split(",") if part.strip()]
    if len(values) < 2:
        raise ValueError("Calculator input must contain two numbers, for example: 12,2")

    a = float(values[0])
    b = float(values[1])
    operation = context.data.get("operation", "+")
    operations: Dict[str, Callable[[float, float], float]] = {
        "+": lambda x, y: x + y,
        "-": lambda x, y: x - y,
        "*": lambda x, y: x * y,
        "/": lambda x, y: x / y,
        "%": lambda x, y: x % y,
        "^": lambda x, y: math.pow(x, y),
    }
    if operation == "/" and b == 0:
        raise ValueError("Cannot divide by zero")
    if operation not in operations:
        raise ValueError(f"Unsupported calculator operation: {operation}")
    value = operations[operation](a, b)
    result = int(value) if value == int(value) else value
    return {"result": result}


def execute_api(context: NodeContext) -> Dict[str, Any]:
    data = context.data
    url = data.get("url") or _text(context.primary_input())
    if not url:
        raise ValueError("API node requires a URL")

    method = data.get("method", "GET").upper()
    headers = data.get("headers") or {}
    if isinstance(headers, str):
        headers = json.loads(headers) if headers.strip() else {}

    body = data.get("body")
    request_data = None
    if body and method in {"POST", "PUT", "DELETE"}:
        request_data = body.encode("utf-8") if isinstance(body, str) else json.dumps(body).encode("utf-8")
        headers.setdefault("Content-Type", "application/json")

    req = urllib.request.Request(url, data=request_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            content = response.read().decode("utf-8")
            try:
                parsed = json.loads(content)
            except json.JSONDecodeError:
                parsed = content
            return {
                "result": parsed,
                "status_code": response.status,
                "headers": dict(response.headers),
            }
    except urllib.error.HTTPError as exc:
        raise ValueError(f"API request failed with status {exc.code}") from exc


def execute_email(context: NodeContext) -> Dict[str, Any]:
    data = context.data
    source = _text(context.primary_input())
    recipient = data.get("recipient", "there")
    subject = data.get("subject") or "Following up"
    tone = data.get("tone", "professional")
    template = data.get("template", "Business Proposal")
    body = (
        f"Subject: {subject}\n\n"
        f"Dear {recipient},\n\n"
        f"I hope you are doing well. I am writing regarding {template.lower()}."
    )
    if source:
        body += f"\n\nContext:\n{source}"
    body += f"\n\nI would appreciate your consideration and look forward to your response.\n\nBest regards,"
    return {"result": body, "text": body, "tone": tone}


def execute_database(context: NodeContext) -> Dict[str, Any]:
    query = (_text(context.data.get("query") or context.primary_input()) or "SELECT * FROM users").strip()
    upper = query.upper()
    tokens = query.replace(";", "").split()
    if upper.startswith("SELECT"):
        table = tokens[-1].lower()
        return {"result": MOCK_DATABASE.get(table, []), "table": table}
    if upper.startswith("INSERT"):
        return {"result": {"affected_rows": 1, "operation": "INSERT", "mock": True}}
    if upper.startswith("UPDATE"):
        return {"result": {"affected_rows": 1, "operation": "UPDATE", "mock": True}}
    if upper.startswith("DELETE"):
        return {"result": {"affected_rows": 1, "operation": "DELETE", "mock": True}}
    raise ValueError("Database node supports SELECT, INSERT, UPDATE, and DELETE")


def execute_image(context: NodeContext) -> Dict[str, Any]:
    data = context.data
    mode = data.get("mode", "generate")
    source = _text(context.primary_input() or data.get("prompt"))
    if mode == "analyze":
        result = {
            "description": "Uploaded image analysis placeholder",
            "details": source or "No image metadata was provided.",
        }
        return {"result": result, "text": json.dumps(result, indent=2)}
    enhanced_prompt = source or "A polished SaaS workflow automation dashboard"
    svg = (
        "data:image/svg+xml;utf8,"
        f"<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>"
        "<rect width='100%' height='100%' fill='%230b1120'/>"
        "<circle cx='120' cy='100' r='80' fill='%2322d3ee' opacity='.35'/>"
        "<circle cx='520' cy='260' r='110' fill='%23a78bfa' opacity='.35'/>"
        f"<text x='40' y='190' fill='white' font-size='24' font-family='Arial'>{enhanced_prompt[:52]}</text>"
        "</svg>"
    )
    return {"result": svg, "image": svg, "prompt": enhanced_prompt}


def execute_output(context: NodeContext) -> Dict[str, Any]:
    return {"result": context.primary_input(), **context.inputs}


NODE_EXECUTOR_REGISTRY = {
    "customInput": execute_input,
    "input": execute_input,
    "aiInput": execute_ai_input,
    "llm": execute_llm,
    "llmRouter": execute_llm_router,
    "calculator": execute_calculator,
    "api": execute_api,
    "email": execute_email,
    "database": execute_database,
    "image": execute_image,
    "customOutput": execute_output,
    "output": execute_output,
    "text": execute_output,
}


def execute_node(context: NodeContext) -> Dict[str, Any]:
    node_type = context.node.get("type") or context.data.get("nodeType")
    executor = NODE_EXECUTOR_REGISTRY.get(node_type)
    if not executor:
        raise ValueError(f"No executor registered for node type: {node_type}")
    return executor(context)
