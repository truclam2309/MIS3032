from fastapi import FastAPI

from data_store import requests  # Backwards-compatible in-memory test access.
from routers import approval, auth, budget, purchase_requests


app = FastAPI(title="RoomFlow API", version="0.2.0")

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
