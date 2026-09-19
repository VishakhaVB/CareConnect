from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ImpactStoryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    content: str = Field(..., min_length=1)
    image_url: str | None = Field(None, max_length=500)


class ImpactStoryUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    content: str | None = Field(None, min_length=1)
    image_url: str | None = Field(None, max_length=500)


class ImpactStoryResponse(BaseModel):
    id: int
    orphanage_id: int
    title: str
    content: str
    image_url: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
