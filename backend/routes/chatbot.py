"""
Chatbot API - Text2NoSQL shopping assistant using Pydantic AI.

How it works:
- Every incoming message is screened by two Groq guardrail models first (see
  backend/chatbot/guardrails.py). Flagged messages never reach the agent.
- Normal conversation (greetings, questions): agent replies with plain text.
- Product queries (show me X, find Y under Z price): agent calls `search_products`
  (see backend/chatbot/agent.py) which queries MongoDB and returns matches.
- This endpoint figures out which type of response to send to the frontend.
"""
import asyncio
from fastapi import APIRouter, Body

from ..chatbot.agent import agent, StoreDeps
from ..chatbot.guardrails import (
    GUARDRAIL_BLOCKED_MESSAGE,
    is_prompt_injection,
    violates_content_policy,
)

router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("")
async def chat_bot(data: dict = Body(...)):
    """
    Main chat endpoint. Accepts a user message and returns either
    a plain text reply or a list of matching products.
    """
    user_message = data.get("message", "").strip()
    if not user_message:
        return {"type": "text", "message": "Please type a message!", "data": None}

    # Guardrails: screen the message with Groq's dedicated safety models before
    # it ever reaches the shopping agent. Fails open (logs + continues) if a
    # guardrail call itself errors, so a Groq hiccup doesn't take down chat.
    try:
        is_injection, is_unsafe = await asyncio.gather(
            is_prompt_injection(user_message),
            violates_content_policy(user_message),
        )
        if is_injection or is_unsafe:
            return {"type": "text", "message": GUARDRAIL_BLOCKED_MESSAGE, "data": None}
    except Exception as e:
        print(f"[Guardrail Error] {e}")

    deps = StoreDeps()

    try:
        result = await agent.run(user_message, deps=deps)
        text_reply = result.output  # plain string from the LLM

        if deps.found_products:
            return {
                "type": "products",
                "message": text_reply,
                "data": deps.found_products,
            }

        return {
            "type": "text",
            "message": text_reply,
            "data": None,
        }

    except Exception as e:
        print(f"[Chatbot Error] {e}")
        return {
            "type": "text",
            "message": "Sorry, I ran into an issue. Please try again or contact customer care at 546464434.",
            "data": None,
        }
