from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.models.badge import Badge
from app.models.donation import Donation
from app.models.event import Event
from app.models.impact_story import ImpactStory
from app.models.orphanage import Orphanage
from app.models.request import ItemRequest
from app.models.review import Review
from app.models.user import User
from app.models.user_badge import UserBadge
from app.models.volunteer import Volunteer
from app.schemas.admin import PlatformStatisticsResponse
from app.schemas.badge import BadgeCreate, BadgeUpdate, BadgeResponse
from app.schemas.donation import DonationResponse
from app.schemas.event import EventResponse
from app.schemas.impact_story import ImpactStoryResponse
from app.schemas.orphanage import OrphanageResponse
from app.schemas.request import ItemRequestResponse
from app.schemas.review import ReviewResponse
from app.schemas.user import UserResponse
from app.schemas.user_badge import UserBadgeResponse
from app.schemas.volunteer import VolunteerResponse
from app.services.notification_service import create_notification

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_role("admin"))],
)


@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/orphanages", response_model=list[OrphanageResponse])
def get_all_orphanages(
    db: Session = Depends(get_db),
):
    return db.query(Orphanage).order_by(Orphanage.created_at.desc()).all()


@router.put("/orphanages/{orphanage_id}/verify", response_model=OrphanageResponse)
def verify_orphanage(
    orphanage_id: int,
    db: Session = Depends(get_db),
):
    orphanage = db.query(Orphanage).filter(Orphanage.id == orphanage_id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage not found",
        )

    orphanage.verification_status = "verified"
    db.commit()
    db.refresh(orphanage)

    create_notification(
        db=db,
        user_id=orphanage.user_id,
        title="Orphanage Verified",
        message=f"Your orphanage profile '{orphanage.name}' has been verified by the administrator.",
    )

    return orphanage


@router.put("/orphanages/{orphanage_id}/reject", response_model=OrphanageResponse)
def reject_orphanage(
    orphanage_id: int,
    db: Session = Depends(get_db),
):
    orphanage = db.query(Orphanage).filter(Orphanage.id == orphanage_id).first()
    if not orphanage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orphanage not found",
        )

    orphanage.verification_status = "rejected"
    db.commit()
    db.refresh(orphanage)

    create_notification(
        db=db,
        user_id=orphanage.user_id,
        title="Orphanage Rejected",
        message=f"Your orphanage profile '{orphanage.name}' verification was rejected.",
    )

    return orphanage


@router.get("/donations", response_model=list[DonationResponse])
def get_all_donations(
    db: Session = Depends(get_db),
):
    return db.query(Donation).order_by(Donation.created_at.desc()).all()


@router.get("/requests", response_model=list[ItemRequestResponse])
def get_all_requests(
    db: Session = Depends(get_db),
):
    return db.query(ItemRequest).order_by(ItemRequest.created_at.desc()).all()


@router.get("/volunteers", response_model=list[VolunteerResponse])
def get_all_volunteers(
    db: Session = Depends(get_db),
):
    return db.query(Volunteer).order_by(Volunteer.created_at.desc()).all()


@router.get("/events", response_model=list[EventResponse])
def get_all_events(
    db: Session = Depends(get_db),
):
    return db.query(Event).order_by(Event.created_at.desc()).all()


@router.get("/reviews", response_model=list[ReviewResponse])
def get_all_reviews(
    db: Session = Depends(get_db),
):
    return db.query(Review).order_by(Review.created_at.desc()).all()


@router.get("/impact-stories", response_model=list[ImpactStoryResponse])
def get_all_impact_stories(
    db: Session = Depends(get_db),
):
    return db.query(ImpactStory).order_by(ImpactStory.created_at.desc()).all()


@router.post("/badges", response_model=BadgeResponse, status_code=status.HTTP_201_CREATED)
def create_badge(
    data: BadgeCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(Badge).filter(Badge.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Badge with this name already exists",
        )

    badge = Badge(
        name=data.name,
        description=data.description,
        icon=data.icon,
    )
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return badge


@router.put("/badges/{badge_id}", response_model=BadgeResponse)
def update_badge(
    badge_id: int,
    data: BadgeUpdate,
    db: Session = Depends(get_db),
):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found",
        )

    if data.name is not None:
        name_conflict = (
            db.query(Badge)
            .filter(Badge.name == data.name, Badge.id != badge_id)
            .first()
        )
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another badge with this name already exists",
            )
        badge.name = data.name

    if data.description is not None:
        badge.description = data.description
    if data.icon is not None:
        badge.icon = data.icon

    db.commit()
    db.refresh(badge)
    return badge


@router.delete("/badges/{badge_id}")
def delete_badge(
    badge_id: int,
    db: Session = Depends(get_db),
):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found",
        )

    db.query(UserBadge).filter(UserBadge.badge_id == badge_id).delete()
    db.delete(badge)
    db.commit()
    return {"message": "Badge deleted successfully"}


@router.post("/badges/{badge_id}/award/{user_id}", response_model=UserBadgeResponse, status_code=status.HTTP_201_CREATED)
def award_badge(
    badge_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    existing = (
        db.query(UserBadge)
        .filter(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Badge already awarded to this user",
        )

    user_badge = UserBadge(
        user_id=user_id,
        badge_id=badge_id,
    )
    db.add(user_badge)
    db.commit()
    db.refresh(user_badge)

    create_notification(
        db=db,
        user_id=user_id,
        title="Badge Awarded!",
        message=f"Congratulations! You received the '{badge.name}' badge.",
    )

    return UserBadgeResponse(
        id=user_badge.id,
        user_id=user_badge.user_id,
        badge_id=user_badge.badge_id,
        awarded_at=user_badge.awarded_at,
        badge=BadgeResponse.model_validate(badge),
    )


@router.get("/statistics", response_model=PlatformStatisticsResponse)
def get_platform_statistics(
    db: Session = Depends(get_db),
):
    return PlatformStatisticsResponse(
        users=db.query(User).count(),
        orphanages=db.query(Orphanage).count(),
        volunteers=db.query(Volunteer).count(),
        donations=db.query(Donation).count(),
        requests=db.query(ItemRequest).count(),
        events=db.query(Event).count(),
    )
