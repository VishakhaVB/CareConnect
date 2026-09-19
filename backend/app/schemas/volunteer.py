from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class VolunteerCreate(BaseModel):
    skills: str | None = None
    availability: str | None = Field(None, max_length=100)
    location: str | None = Field(None, max_length=150)


class VolunteerUpdate(BaseModel):
    skills: str | None = None
    availability: str | None = Field(None, max_length=100)
    location: str | None = Field(None, max_length=150)


class VolunteerResponse(BaseModel):
    id: int
    user_id: int
    skills: str | None
    availability: str | None
    location: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
