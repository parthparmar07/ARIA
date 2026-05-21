"""Shared utilities."""
from __future__ import annotations

import json
import re
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt(name: str) -> str:
    return (PROMPTS_DIR / f"{name}.md").read_text(encoding="utf-8")


def render(template: str, **vars) -> str:
    out = template
    for k, v in vars.items():
        out = out.replace(f"{{{{{k}}}}}", str(v))
    return out


def extract_json(text: str) -> dict:
    """Pull the first JSON object out of a model response, tolerating fences."""
    text = text.strip()
    # Strip code fences
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    # Greedy from first { to last }
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"No JSON object found in response: {text[:200]}")
    return json.loads(text[start : end + 1])
