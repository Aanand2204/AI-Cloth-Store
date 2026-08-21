"""
Retrieval service — every read-only endpoint: product listing/filtering,
admin/profile lookups, cart/order history, and the AI shopping assistant
(the chatbot only ever queries MongoDB via search_products, never writes).
Also serves the frontend and uploaded files, since browsing is read-heavy.

Reuses the exact same endpoint functions as the monolith (main.py) and the
ingestion service — nothing is duplicated or reimplemented, just re-wired
onto a separate FastAPI app so it can be deployed as its own container.
Shares backend/ (models, database, auth, utils) and the same MongoDB Atlas
cluster with the ingestion service; there is no data split, only an API split.
"""
import os

import logfire
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routes.products import get_products
from backend.routes.auth import check_is_admin
from backend.routes.google_auth import get_google_client_id
from backend.routes.profile import get_profile
from backend.routes.orders import get_order_history
from backend.routes.cart import get_cart
from backend.routes.chatbot import chat_bot

app = FastAPI(title="ClothStore Retrieval Service")

logfire.configure(send_to_logfire="if-token-present")
logfire.instrument_fastapi(app)
logfire.instrument_pydantic()

# The frontend served here calls out to the ingestion service (a different
# origin once split across containers/ports) for every write.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

products_router = APIRouter(prefix="/products", tags=["Products"])
products_router.add_api_route("", get_products, methods=["GET"])
app.include_router(products_router)

auth_router = APIRouter(prefix="/auth", tags=["Auth"])
auth_router.add_api_route("/is-admin", check_is_admin, methods=["GET"])
auth_router.add_api_route("/google-client-id", get_google_client_id, methods=["GET"])
auth_router.add_api_route("/profile", get_profile, methods=["GET"])
app.include_router(auth_router)

orders_router = APIRouter(prefix="/orders", tags=["Orders"])
orders_router.add_api_route("/{user_email}", get_order_history, methods=["GET"])
app.include_router(orders_router)

cart_router = APIRouter(prefix="/cart", tags=["Cart"])
cart_router.add_api_route("/{user_email}", get_cart, methods=["GET"])
app.include_router(cart_router)

chat_router = APIRouter(prefix="/chat", tags=["Chatbot"])
chat_router.add_api_route("", chat_bot, methods=["POST"])
app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "retrieval"}


@app.get("/config")
def frontend_config():
    """
    Tells the frontend where the ingestion service actually lives. Set via
    INGESTION_SERVICE_URL at deploy time (e.g. its Cloud Run URL) — the two
    services get unrelated hostnames on Cloud Run, so the frontend can't
    guess this the way it can for a same-host docker-compose setup.
    """
    return {"ingestion_base_url": os.getenv("INGESTION_SERVICE_URL", "")}


UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/", StaticFiles(directory="Frontend", html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    print("Starting Retrieval Service...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
