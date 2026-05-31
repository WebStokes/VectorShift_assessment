from services.llm_router import route_prompt

response = route_prompt(
    "Write a Spring Boot REST API"
)

print(response)