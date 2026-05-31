from services.llm_service import (
    call_gemini,
)


def evaluate_responses(
    user_input,
    response_a,
    response_b,
):

    evaluation_prompt = f"""
User Request:
{user_input}

Response A:
{response_a}

Response B:
{response_b}

Which response is better?

Return ONLY the better response.
"""

    return call_gemini(
        evaluation_prompt
    )