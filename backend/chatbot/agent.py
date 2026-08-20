"""
The Pydantic AI shopping agent: system prompt, dependencies, and its
`search_products` tool for querying the ClothStore MongoDB catalog.
"""
from typing import List, Optional, Dict, Any

from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

from ..database import products_collection
from ..utils.images import resolve_image_field


class StoreDeps(BaseModel):
    """Holds the list of products found during this run."""
    found_products: List[Dict[str, Any]] = []

    class Config:
        arbitrary_types_allowed = True


agent = Agent(
    "groq:qwen/qwen3.6-27b",
    deps_type=StoreDeps,
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
        resolve_image_field(r)
        processed.append(r)

    # Store results so the endpoint can send them to the frontend
    ctx.deps.found_products = processed

    if not processed:
        return "No products found matching those filters."
    return f"Found {len(processed)} products matching the request."
