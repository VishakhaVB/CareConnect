from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DonationReceipt(Base):
    __tablename__ = "donation_receipts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    donation_id: Mapped[int] = mapped_column(
        ForeignKey("donations.id"),
        nullable=False,
        unique=True,
    )

    receipt_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    receipt_file: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    issued_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )