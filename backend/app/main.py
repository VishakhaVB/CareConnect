from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import (
    admin,
    auth,
    badges,
    donations,
    events,
    impact_stories,
    notifications,
    orphanages,
    requests,
    reviews,
    users,
    volunteers,
)

app = FastAPI(
    title="CareConnect API",
    version="1.0.0",
    description="Community Donation Platform API connecting donors, volunteers, and orphanages.",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register active routes
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orphanages.router)
app.include_router(requests.router)
app.include_router(donations.router)
app.include_router(volunteers.router)
app.include_router(events.router)
app.include_router(reviews.router)
app.include_router(impact_stories.router)
app.include_router(notifications.router)
app.include_router(badges.router)
app.include_router(admin.router)


@app.get("/", tags=["System"])
def root():
    return {
        "message": "CareConnect API is running"
    }


@app.get("/health", tags=["System"])
def health():
    return {
        "status": "healthy"
    }