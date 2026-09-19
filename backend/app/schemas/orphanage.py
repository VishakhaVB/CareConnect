from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class OrphanageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    address: str = Field(..., min_length=1)


class OrphanageUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    address: str | None = Field(None, min_length=1)


class OrphanageResponse(BaseModel):
    id: int
    user_id: int
    name: str
    address: str
    verification_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
