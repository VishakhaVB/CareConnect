from fastapi import FastAPI

from app.api.routes import auth

app = FastAPI(
    title="CareConnect API",
    version="1.0.0",
)

app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "CareConnect API is running"
    }