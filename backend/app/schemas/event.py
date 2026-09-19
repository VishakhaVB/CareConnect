from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    event_date: datetime
    location: str | None = Field(None, max_length=255)
    status: str = Field(default="upcoming", max_length=30)


class EventUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = None
    event_date: datetime | None = None
    location: str | None = Field(None, max_length=255)
    status: str | None = Field(None, max_length=30)


class EventResponse(BaseModel):
    id: int
    orphanage_id: int
    title: str
    description: str | None
    event_date: datetime
    location: str | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
