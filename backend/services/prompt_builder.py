from typing import Tuple

def classify_task(user_input: str):

    text = user_input.lower()

    coding_keywords = [
        "code",
        "java",
        "python",
        "spring",
        "react",
        "api",
        "algorithm",
        "sql",
        "backend",
        "frontend",
    ]

    content_keywords = [
        "linkedin",
        "blog",
        "article",
        "email",
        "post",
        "content",
        "marketing",
    ]

    learning_keywords = [
        "explain",
        "teach",
        "what is",
        "how does",
        "difference",
        "why",
    ]

    if any(keyword in text for keyword in coding_keywords):
        return "coding"

    if any(keyword in text for keyword in content_keywords):
        return "content"

    if any(keyword in text for keyword in learning_keywords):
        return "learning"

    return "general"

def build_prompt(user_input: str):

    task_type = classify_task(user_input)

    if task_type == "coding":

        return f"""
You are a senior software architect.

Generate clean, production-ready code.

Explain important decisions.

User Request:
{user_input}
"""

    if task_type == "learning":

        return f"""
You are an expert teacher.

Explain concepts clearly using examples.

User Question:
{user_input}
"""

    if task_type == "content":

        return f"""
You are an expert content creator.

Create engaging, professional content.

User Request:
{user_input}
"""

    return f"""
You are a helpful AI assistant.

User Request:
{user_input}
"""

def get_task_type(user_input: str):

    return classify_task(user_input)