from services.llm_service import (
    call_gemini,
    call_groq,
)

print("Testing Gemini...")
print(
    call_gemini(
        "Say hello in one sentence"
    )
)

print("\nTesting Groq...")
print(
    call_groq(
        "Say hello in one sentence"
    )
)