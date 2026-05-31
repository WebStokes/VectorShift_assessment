import os
from dotenv import load_dotenv

try:
    from google import genai
except ImportError:
    genai = None

try:
    from groq import Groq
except ImportError:
    Groq = None

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

gemini_client = genai.Client(api_key=GEMINI_API_KEY) if genai and GEMINI_API_KEY else None
groq_client = Groq(api_key=GROQ_API_KEY) if Groq and GROQ_API_KEY else None


def call_gemini(prompt: str):
    if not gemini_client:
        return (
            "Gemini is not configured. Add GEMINI_API_KEY and install the "
            "google-genai package to enable live Gemini responses.\n\n"
            f"Prompt:\n{prompt}"
        )

    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text


def call_groq(prompt: str):
    if not groq_client:
        return (
            "Groq is not configured. Add GROQ_API_KEY and install the groq "
            "package to enable live Groq responses.\n\n"
            f"Prompt:\n{prompt}"
        )

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response.choices[0].message.content
