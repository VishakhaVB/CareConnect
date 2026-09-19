from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EventParticipationResponse(BaseModel):
    id: int
    event_id: int
    volunteer_id: int
    status: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)
