from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.user_badge import UserBadge
from app.models.badge import Badge
from app.schemas.user import UserResponse
from app.schemas.user_badge import UserBadgeResponse
from app.schemas.badge import BadgeResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get("/me/badges", response_model=list[UserBadgeResponse])
def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_badges = (
        db.query(UserBadge)
        .filter(UserBadge.user_id == current_user.id)
        .all()
    )

    result = []
    for ub in user_badges:
        badge = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        result.append(
            UserBadgeResponse(
                id=ub.id,
                user_id=ub.user_id,
                badge_id=ub.badge_id,
                awarded_at=ub.awarded_at,
                badge=BadgeResponse.model_validate(badge) if badge else None,
            )
        )
    return result