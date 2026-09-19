from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ItemRequestCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    item_type: str = Field(..., min_length=1, max_length=100)
    quantity_needed: int = Field(..., gt=0)
    urgency: str = Field(default="normal", max_length=30)


class ItemRequestUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = None
    item_type: str | None = Field(None, min_length=1, max_length=100)
    quantity_needed: int | None = Field(None, gt=0)
    urgency: str | None = Field(None, max_length=30)
    status: str | None = Field(None, max_length=30)


class ItemRequestResponse(BaseModel):
    id: int
    orphanage_id: int
    title: str
    description: str | None
    item_type: str
    quantity_needed: int
    urgency: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
