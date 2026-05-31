from services.llm_router import (
    route_prompt
)

result = route_prompt(
    "Write a Spring Boot REST API"
)

print(result["task_type"])
print(result["model"])

print("\n")

print(result["response"][:500])