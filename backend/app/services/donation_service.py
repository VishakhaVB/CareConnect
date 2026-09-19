import uuid
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.donation import Donation
from app.models.donation_receipt import DonationReceipt
from app.models.orphanage import Orphanage
from app.models.request import ItemRequest
from app.services.notification_service import create_notification


def create_donation(
    db: Session,
    donor_id: int,
    orphanage_id: int,
    donation_type: str,
    amount: Decimal | None = None,
    item_description: str | None = None,
    quantity: int | None = None,
    request_id: int | None = None,
) -> Donation:
    orphanage = db.query(Orphanage).filter(Orphanage.id == orphanage_id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage not found",
        )

    if request_id is not None:
        item_req = (
            db.query(ItemRequest)
            .filter(
                ItemRequest.id == request_id,
                ItemRequest.orphanage_id == orphanage_id,
            )
            .first()
        )
        if not item_req:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Linked item request does not exist or does not belong to this orphanage",
            )

    donation = Donation(
        donor_id=donor_id,
        orphanage_id=orphanage_id,
        request_id=request_id,
        donation_type=donation_type,
        amount=amount,
        item_description=item_description,
        quantity=quantity,
        status="pledged",
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    # Notify orphanage owner
    create_notification(
        db=db,
        user_id=orphanage.user_id,
        title="New Donation Received",
        message=f"You received a new {donation_type} donation (ID: {donation.id}).",
    )

    # Notify donor
    create_notification(
        db=db,
        user_id=donor_id,
        title="Donation Pledged",
        message=f"Thank you for pledging a {donation_type} donation to {orphanage.name}.",
    )

    return donation


def get_user_donations(
    db: Session,
    donor_id: int,
) -> list[Donation]:
    return (
        db.query(Donation)
        .filter(Donation.donor_id == donor_id)
        .order_by(Donation.created_at.desc())
        .all()
    )


def get_orphanage_donations(
    db: Session,
    orphanage_id: int,
) -> list[Donation]:
    return (
        db.query(Donation)
        .filter(Donation.orphanage_id == orphanage_id)
        .order_by(Donation.created_at.desc())
        .all()
    )


def get_or_create_receipt(
    db: Session,
    donation: Donation,
) -> DonationReceipt:
    receipt = (
        db.query(DonationReceipt)
        .filter(DonationReceipt.donation_id == donation.id)
        .first()
    )
    if not receipt:
        unique_suffix = uuid.uuid4().hex[:8].upper()
        receipt_number = f"REC-{donation.id}-{unique_suffix}"
        receipt = DonationReceipt(
            donation_id=donation.id,
            receipt_number=receipt_number,
            receipt_file=None,
        )
        db.add(receipt)
        db.commit()
        db.refresh(receipt)

    return receipt
