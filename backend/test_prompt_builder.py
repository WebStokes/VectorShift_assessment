from services.prompt_builder import (
    classify_task,
    build_prompt,
)

query = "Write a Spring Boot REST API"

print(
    "Task Type:",
    classify_task(query)
)

print("\nPrompt:\n")

print(
    build_prompt(query)
)