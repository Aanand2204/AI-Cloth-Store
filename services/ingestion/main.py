"""
Ingestion service — every endpoint that writes to MongoDB: product
create/update/delete, bulk ingestion (demo-gen, JSON bulk, Excel+zip upload),
account registration/login/edits, cart writes, and order placement.

Reuses the exact same endpoint functions as the monolith (main.py) and the
retrieval service — nothing is duplicated or reimplemented, just re-wired
onto a separate FastAPI app so it can be deployed as its own container.
Shares backend/ (models, database, auth, utils) and the same MongoDB Atlas
cluster with the retrieval service; there is no data split, only an API split.
"""
import os

import logfire
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.products import add_product, delete_all_products, delete_product, update_product
from backend.routes.products_bulk import add_multiple_products, bulk_generate_500, bulk_upload_products
from backend.routes.auth import login, register
from backend.routes.google_auth import google_login
from backend.routes.profile import delete_account, update_profile, upload_avatar
from backend.routes.orders import place_order
from backend.routes.cart import add_to_cart, clear_cart

app = FastAPI(title="ClothStore Ingestion Service")

logfire.configure(send_to_logfire="if-token-present")
logfire.instrument_fastapi(app)
logfire.instrument_pydantic()

# The frontend (served by the retrieval service, a different origin once split
# across containers/ports) calls straight into this service for writes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

products_router = APIRouter(prefix="/products", tags=["Products"])
products_router.add_api_route("", add_product, methods=["POST"])
products_router.add_api_route("", delete_all_products, methods=["DELETE"])
products_router.add_api_route("/{id}", update_product, methods=["PUT"])
products_router.add_api_route("/{id}", delete_product, methods=["DELETE"])
products_router.add_api_route("/bulk-generate-500", bulk_generate_500, methods=["POST"])
products_router.add_api_route("/bulk", add_multiple_products, methods=["POST"])
products_router.add_api_route("/bulk-upload", bulk_upload_products, methods=["POST"])
app.include_router(products_router)

auth_router = APIRouter(prefix="/auth", tags=["Auth"])
auth_router.add_api_route("/register", register, methods=["POST"])
auth_router.add_api_route("/login", login, methods=["POST"])
auth_router.add_api_route("/google", google_login, methods=["POST"])
auth_router.add_api_route("/profile", update_profile, methods=["PUT"])
auth_router.add_api_route("/avatar", upload_avatar, methods=["POST"])
auth_router.add_api_route("/account", delete_account, methods=["DELETE"])
app.include_router(auth_router)

orders_router = APIRouter(prefix="/orders", tags=["Orders"])
orders_router.add_api_route("", place_order, methods=["POST"])
app.include_router(orders_router)

cart_router = APIRouter(prefix="/cart", tags=["Cart"])
cart_router.add_api_route("/add", add_to_cart, methods=["POST"])
cart_router.add_api_route("/{user_email}", clear_cart, methods=["DELETE"])
app.include_router(cart_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ingestion"}


if __name__ == "__main__":
    import uvicorn
    print("Starting Ingestion Service...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
