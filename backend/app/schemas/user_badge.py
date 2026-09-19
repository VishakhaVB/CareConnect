from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.badge import BadgeResponse


class UserBadgeAward(BaseModel):
    user_id: int
    badge_id: int


class UserBadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_id: int
    awarded_at: datetime
    badge: BadgeResponse | None = None

    model_config = ConfigDict(from_attributes=True)
