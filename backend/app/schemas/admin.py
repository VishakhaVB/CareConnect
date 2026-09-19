from pydantic import BaseModel


class PlatformStatisticsResponse(BaseModel):
    users: int
    orphanages: int
    volunteers: int
    donations: int
    requests: int
    events: int
