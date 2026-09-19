from pydantic import BaseModel, ConfigDict, Field


class BadgeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    icon: str | None = Field(None, max_length=255)


class BadgeUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
    icon: str | None = Field(None, max_length=255)


class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str | None
    icon: str | None

    model_config = ConfigDict(from_attributes=True)
