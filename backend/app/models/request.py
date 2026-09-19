from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ItemRequest(Base):
    __tablename__ = "item_requests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    orphanage_id: Mapped[int] = mapped_column(
        ForeignKey("orphanages.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    item_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    quantity_needed: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    urgency: Mapped[str] = mapped_column(
        String(30),
        default="normal",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="open",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )