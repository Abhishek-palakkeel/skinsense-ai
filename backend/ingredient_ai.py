import os
import json

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def search_ingredient(query: str):
    prompt = f"""
You are a professional skincare ingredient expert.

Return ONLY valid JSON.

Ingredient: {query}

Format:

{{
  "name": "",
  "category": "",
  "description": "",
  "benefits": [],
  "sideEffects": [],
  "suitableSkinTypes": [],
  "avoidMixingWith": [],
  "usage": "",
  "pregnancySafe": true,
  "evidenceLevel": "Strong"
}}

Do not include markdown.
Do not include explanations outside JSON.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.2,
    )

    text = response.choices[0].message.content

    return json.loads(text)