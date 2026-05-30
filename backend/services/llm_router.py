def choose_model(prompt):

    prompt = prompt.lower()

    if "code" in prompt:
        return "deepseek"

    if "story" in prompt:
        return "gemini"

    return "qwen"