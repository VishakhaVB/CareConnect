from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EventParticipation(Base):
    __tablename__ = "event_participations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id"),
        nullable=False
    )
    volunteer_id: Mapped[int] = mapped_column(
        ForeignKey("volunteers.id"),
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30),
        default="registered",
        nullable=False
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )