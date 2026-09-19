from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.badge import Badge
from app.schemas.badge import BadgeResponse

router = APIRouter(
    prefix="/badges",
    tags=["Badges"],
)


@router.get("", response_model=list[BadgeResponse])
def list_badges(
    db: Session = Depends(get_db),
):
    return db.query(Badge).all()
