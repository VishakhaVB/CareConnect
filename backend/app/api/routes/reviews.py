from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.models.orphanage import Orphanage
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(
    prefix="/orphanages",
    tags=["Reviews"],
)


@router.post("/{orphanage_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    orphanage_id: int,
    data: ReviewCreate,
    current_user: User = Depends(require_role("donor", "both")),
    db: Session = Depends(get_db),
):
    orphanage = db.query(Orphanage).filter(Orphanage.id == orphanage_id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage not found",
        )

    existing = (
        db.query(Review)
        .filter(
            Review.orphanage_id == orphanage_id,
            Review.user_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this orphanage",
        )

    review = Review(
        user_id=current_user.id,
        orphanage_id=orphanage_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/{orphanage_id}/reviews", response_model=list[ReviewResponse])
def list_orphanage_reviews(
    orphanage_id: int,
    db: Session = Depends(get_db),
):
    orphanage = db.query(Orphanage).filter(Orphanage.id == orphanage_id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage not found",
        )

    return (
        db.query(Review)
        .filter(Review.orphanage_id == orphanage_id)
        .order_by(Review.created_at.desc())
        .all()
    )
