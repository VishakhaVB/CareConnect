from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role, get_current_orphanage
from app.db.database import get_db
from app.models.donation import Donation
from app.models.orphanage import Orphanage
from app.models.user import User
from app.schemas.donation import (
    DonationCreate,
    DonationResponse,
)
from app.schemas.donation_receipt import DonationReceiptResponse
from app.services.donation_service import (
    create_donation,
    get_user_donations,
    get_orphanage_donations,
    get_or_create_receipt,
)

router = APIRouter(
    prefix="/donations",
    tags=["Donations"],
)


@router.post("", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
def make_donation(
    data: DonationCreate,
    current_user: User = Depends(require_role("donor", "both")),
    db: Session = Depends(get_db),
):
    donation = create_donation(
        db=db,
        donor_id=current_user.id,
        orphanage_id=data.orphanage_id,
        donation_type=data.donation_type,
        amount=data.amount,
        item_description=data.item_description,
        quantity=data.quantity,
        request_id=data.request_id,
    )
    return donation


@router.get("/my", response_model=list[DonationResponse])
def get_my_donations(
    current_user: User = Depends(require_role("donor", "both")),
    db: Session = Depends(get_db),
):
    return get_user_donations(db=db, donor_id=current_user.id)


@router.get("/received", response_model=list[DonationResponse])
def get_received_donations(
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    return get_orphanage_donations(db=db, orphanage_id=orphanage.id)


@router.get("/{donation_id}", response_model=DonationResponse)
def get_donation(
    donation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found",
        )

    # Check access: donor, orphanage owner, or admin
    is_donor = donation.donor_id == current_user.id
    is_admin = current_user.role == "admin"
    orphanage = db.query(Orphanage).filter(Orphanage.id == donation.orphanage_id).first()
    is_orphanage_owner = orphanage is not None and orphanage.user_id == current_user.id

    if not (is_donor or is_admin or is_orphanage_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this donation",
        )

    return donation


@router.get("/{donation_id}/receipt", response_model=DonationReceiptResponse)
def get_donation_receipt(
    donation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found",
        )

    is_donor = donation.donor_id == current_user.id
    is_admin = current_user.role == "admin"
    orphanage = db.query(Orphanage).filter(Orphanage.id == donation.orphanage_id).first()
    is_orphanage_owner = orphanage is not None and orphanage.user_id == current_user.id

    if not (is_donor or is_admin or is_orphanage_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this receipt",
        )

    receipt = get_or_create_receipt(db=db, donation=donation)
    return receipt
