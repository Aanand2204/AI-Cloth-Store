from fastapi import FastAPI

from backend.routes import products, products_bulk, orders, cart, chatbot, auth, google_auth, profile
import os
import uvicorn
import logfire

# Initialize FastAPI app
app = FastAPI()


# Configure Logfire for Observability.
# The SDK looks for LOGFIRE_TOKEN; this project stores it as LOGFIRE_API_KEY in
# .env, so pass it through explicitly (falls back to LOGFIRE_TOKEN / local creds).
logfire.configure(
    send_to_logfire='if-token-present',
    token=os.getenv('LOGFIRE_TOKEN') or os.getenv('LOGFIRE_API_KEY'),
)
logfire.instrument_fastapi(app)
logfire.instrument_pydantic()
logfire.instrument_pydantic_ai()  # agent run traces + online-evaluation events

# Create uploads folder for product images
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    

# Include API route modules
app.include_router(products.router)
app.include_router(products_bulk.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(chatbot.router)
app.include_router(auth.router)
app.include_router(google_auth.router)
app.include_router(profile.router)


@app.get("/config")
def frontend_config():
    """
    Tells the frontend where the ingestion service lives. The monolith serves
    both reads and writes itself, so ingestion is just this same origin —
    without this, the frontend falls back to guessing port 8001 (the split
    services' ingestion port), which isn't running here and breaks any write
    call (e.g. Google sign-in) with a fetch failure.
    """
    return {"ingestion_base_url": ""}

# Serve uploaded files statically
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Serve Frontend natively
app.mount("/", StaticFiles(directory="Frontend", html=True), name="frontend")

if __name__ == "__main__":
    print("⚙️ Starting backend server (FastAPI)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
