import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_store import requests  # Backwards-compatible in-memory test access.
from routers import approval, auth, budget, purchase_requests


app = FastAPI(title="RoomFlow API", version="0.2.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(budget.router)
app.include_router(purchase_requests.router)
app.include_router(approval.router)


@app.get("/")
def root():
    return {
        "message": "RoomFlow API",
        "version": "0.2.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
