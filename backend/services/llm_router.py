from services.llm_service import (
    call_gemini,
    call_groq,
)

from services.prompt_builder import (
    build_prompt,
    get_task_type,
)

from services.evaluator import (
    evaluate_responses,
)


def route_prompt(
    user_input: str,
    mode: str = "auto",
):

    task_type = get_task_type(
        user_input
    )

    prompt = build_prompt(
        user_input
    )

    if mode == "gemini":

        response = call_gemini(prompt)

        return {
            "task_type": task_type,
            "model": "gemini",
            "response": response,
        }

    if mode == "groq":

        response = call_groq(prompt)

        return {
            "task_type": task_type,
            "model": "groq",
            "response": response,
        }

    coding_keywords = [
        "code",
        "java",
        "python",
        "spring",
        "react",
        "api",
        "algorithm",
    ]

    text = user_input.lower()

    if any(
        keyword in text
        for keyword in coding_keywords
    ):

        response = call_groq(prompt)

        return {
            "task_type": task_type,
            "model": "groq",
            "response": response,
        }

    response = call_gemini(prompt)

    return {
        "task_type": task_type,
        "model": "gemini",
        "response": response,
    }


def compare_models(
    user_input: str,
):

    prompt = build_prompt(
        user_input
    )

    gemini_response = call_gemini(
        prompt
    )

    groq_response = call_groq(
        prompt
    )

    final_response = evaluate_responses(
        user_input,
        gemini_response,
        groq_response,
    )

    return {
        "task_type": get_task_type(
            user_input
        ),
        "model": "compare",
        "response": final_response,
    }