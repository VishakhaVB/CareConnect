from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ImpactStory(Base):
    __tablename__ = "impact_stories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    orphanage_id: Mapped[int] = mapped_column(
        ForeignKey("orphanages.id"),
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )