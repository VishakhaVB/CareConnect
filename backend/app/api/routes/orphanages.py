from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.orphanage import Orphanage
from app.models.user import User
from app.schemas.orphanage import (
    OrphanageCreate,
    OrphanageUpdate,
    OrphanageResponse,
)

router = APIRouter(
    prefix="/orphanages",
    tags=["Orphanages"],
)


@router.post("", response_model=OrphanageResponse, status_code=status.HTTP_201_CREATED)
def create_orphanage_profile(
    data: OrphanageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "donor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Donors cannot create orphanage profiles",
        )

    existing = db.query(Orphanage).filter(Orphanage.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an orphanage profile",
        )

    orphanage = Orphanage(
        user_id=current_user.id,
        name=data.name,
        address=data.address,
        verification_status="pending",
    )
    db.add(orphanage)
    db.commit()
    db.refresh(orphanage)
    return orphanage


@router.get("", response_model=list[OrphanageResponse])
def list_orphanages(
    verification_status: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Orphanage)
    if verification_status:
        query = query.filter(Orphanage.verification_status == verification_status)
    return query.order_by(Orphanage.created_at.desc()).all()


@router.get("/me", response_model=OrphanageResponse)
def get_my_orphanage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "donor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Donors cannot perform orphanage-owner operations",
        )

    orphanage = db.query(Orphanage).filter(Orphanage.user_id == current_user.id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage profile not found",
        )
    return orphanage


@router.put("/me", response_model=OrphanageResponse)
def update_my_orphanage(
    data: OrphanageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "donor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Donors cannot perform orphanage-owner operations",
        )

    orphanage = db.query(Orphanage).filter(Orphanage.user_id == current_user.id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage profile not found",
        )

    if data.name is not None:
        orphanage.name = data.name
    if data.address is not None:
        orphanage.address = data.address

    db.commit()
    db.refresh(orphanage)
    return orphanage


@router.get("/{orphanage_id}", response_model=OrphanageResponse)
def get_orphanage_by_id(
    orphanage_id: int,
    db: Session = Depends(get_db),
):
    orphanage = db.query(Orphanage).filter(Orphanage.id == orphanage_id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage not found",
        )
    return orphanage
