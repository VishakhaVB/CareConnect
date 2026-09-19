from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.models.user import User
from app.models.volunteer import Volunteer
from app.schemas.volunteer import (
    VolunteerCreate,
    VolunteerUpdate,
    VolunteerResponse,
)

router = APIRouter(
    prefix="/volunteers",
    tags=["Volunteers"],
)


@router.post("", response_model=VolunteerResponse, status_code=status.HTTP_201_CREATED)
def create_volunteer_profile(
    data: VolunteerCreate,
    current_user: User = Depends(require_role("volunteer", "both")),
    db: Session = Depends(get_db),
):
    existing = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Volunteer profile already exists for this user",
        )

    volunteer = Volunteer(
        user_id=current_user.id,
        skills=data.skills,
        availability=data.availability,
        location=data.location,
    )
    db.add(volunteer)
    db.commit()
    db.refresh(volunteer)
    return volunteer


@router.get("/me", response_model=VolunteerResponse)
def get_my_volunteer_profile(
    current_user: User = Depends(require_role("volunteer", "both")),
    db: Session = Depends(get_db),
):
    volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found",
        )
    return volunteer


@router.put("/me", response_model=VolunteerResponse)
def update_my_volunteer_profile(
    data: VolunteerUpdate,
    current_user: User = Depends(require_role("volunteer", "both")),
    db: Session = Depends(get_db),
):
    volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found",
        )

    if data.skills is not None:
        volunteer.skills = data.skills
    if data.availability is not None:
        volunteer.availability = data.availability
    if data.location is not None:
        volunteer.location = data.location

    db.commit()
    db.refresh(volunteer)
    return volunteer
