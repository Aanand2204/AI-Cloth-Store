"""
Chatbot API - Text2NoSQL shopping assistant using Pydantic AI.

How it works:
- Normal conversation (greetings, questions): agent replies with plain text.
- Product queries (show me X, find Y under Z price): agent calls `search_products`
    tool which queries MongoDB and returns matching products.
- The endpoint figures out which type of response to send to the frontend.
"""


from fastapi import APIRouter, Body
from backend.database import products_collection
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chatbot"])


# ──────────────────────────────────────────────
# Agent Dependencies: carries the product search
# results back out of the tool call
# ──────────────────────────────────────────────


class StoreDeps(BaseModel):
    """Holds the list of products found during this run."""
    found_products: List[Dict[str, Any]] = []

    class Config:
        arbitrary_types_allowed = True


# ──────────────────────────────────────────────
# Agent - plain string output (simple & reliable)
# We detect product queries from tool usage, NOT
# by forcing a rigid output schema on the LLM.
# ──────────────────────────────────────────────


agent = Agent(
    "groq:qwen/qwen3-32b",
    deps_type=StoreDeps, ## they way it will output
    system_prompt=(
        "You are a friendly shopping assistant for ClothStore — an online clothing store. "
        "The store has 3 categories: men, women, and kids."
        "\n\n"
        "RULES:\n"
        "1. If the user greets you or asks who you are → reply naturally and warmly.\n"
        "2. If the user wants to browse, find, or buy products → ALWAYS call the `search_products` tool with the right filters. Never describe products yourself.\n"
        "3. After calling `search_products`, confirm to the user what you searched for (e.g. 'Here are men's shirts under ₹2000!').\n"
        "4. If the user asks something completely unrelated to shopping or clothes, reply: "
        "'Sorry, I can't help with that. For assistance, contact our customer care at 546464434.'\n"
        "5. DO NOT make up product names, prices, or details ever."
    ),
)



@agent.tool
def search_products(
    ctx: RunContext[StoreDeps],
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    max_price: Optional[int] = None,
    min_price: Optional[int] = None,
) -> str:
    """
    Search the ClothStore product database.

    Args:
        category: Filter by category — one of 'men', 'women', 'kids', 'accessories'.
        keyword: Search by product name keyword (e.g. 'shirt', 'dress', 'jacket').
        max_price: Maximum price in rupees (e.g. 2000 means under ₹2000).
        min_price: Minimum price in rupees.

    Returns:
        A short confirmation string of what was found.
    """
    query: Dict[str, Any] = {}

    if category:
        query["category"] = {"$regex": f"^{category.strip()}$", "$options": "i"}

    if keyword:
        query["name"] = {"$regex": keyword.strip(), "$options": "i"}

    # Build price filter
    price_filter: Dict[str, int] = {}
    if max_price is not None:
        price_filter["$lte"] = max_price
    if min_price is not None:
        price_filter["$gte"] = min_price
    if price_filter:
        query["price"] = price_filter

    raw_results = list(products_collection.find(query).limit(8))

    processed = []
    for r in raw_results:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
        r.pop("image_data", None)       # never send Base64 blobs to the LLM
        r.pop("image_content_type", None)
        processed.append(r)

    # Store results so the endpoint can send them to the frontend
    ctx.deps.found_products = processed

    if not processed:
        return "No products found matching those filters."
    return f"Found {len(processed)} products matching the request."


@router.post("")
async def chat_bot(data: dict = Body(...)):
    """
    Main chat endpoint. Accepts a user message and returns either
    a plain text reply or a list of matching products.
    """
    user_message = data.get("message", "").strip()
    if not user_message:
        return {"type": "text", "message": "Please type a message!", "data": None}

    deps = StoreDeps()

    try:
        result = await agent.run(user_message, deps=deps)
        text_reply = result.output  # plain string from the LLM

        # If the tool was called and found products → send them to the frontend
        if deps.found_products:
            return {
                "type": "products",
                "message": text_reply,
                "data": deps.found_products,
            }

        # Otherwise just a normal conversation reply
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
