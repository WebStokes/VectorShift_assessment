from services.llm_router import (
    compare_models,
)

response = compare_models(
    "Write a Spring Boot REST API"
)

print(response)