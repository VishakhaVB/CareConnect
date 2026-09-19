from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role, get_current_orphanage
from app.db.database import get_db
from app.models.event import Event
from app.models.event_participation import EventParticipation
from app.models.orphanage import Orphanage
from app.models.user import User
from app.models.volunteer import Volunteer
from app.schemas.event import (
    EventCreate,
    EventUpdate,
    EventResponse,
)
from app.schemas.event_participation import EventParticipationResponse

router = APIRouter(
    prefix="/events",
    tags=["Events"],
)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    event = Event(
        orphanage_id=orphanage.id,
        title=data.title,
        description=data.description,
        event_date=data.event_date,
        location=data.location,
        status=data.status,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("", response_model=list[EventResponse])
def list_events(
    status: str | None = None,
    orphanage_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Event)
    if status:
        query = query.filter(Event.status == status)
    if orphanage_id:
        query = query.filter(Event.orphanage_id == orphanage_id)
    return query.order_by(Event.event_date.asc()).all()


@router.get("/my/participations", response_model=list[EventParticipationResponse])
def get_my_participations(
    current_user: User = Depends(require_role("volunteer", "both")),
    db: Session = Depends(get_db),
):
    volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not volunteer:
        return []

    return (
        db.query(EventParticipation)
        .filter(EventParticipation.volunteer_id == volunteer.id)
        .order_by(EventParticipation.joined_at.desc())
        .all()
    )


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    data: EventUpdate,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.orphanage_id != orphanage.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this event",
        )

    if data.title is not None:
        event.title = data.title
    if data.description is not None:
        event.description = data.description
    if data.event_date is not None:
        event.event_date = data.event_date
    if data.location is not None:
        event.location = data.location
    if data.status is not None:
        event.status = data.status

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    if event.orphanage_id != orphanage.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this event",
        )

    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}


@router.post("/{event_id}/participate", response_model=EventParticipationResponse, status_code=status.HTTP_201_CREATED)
def participate_in_event(
    event_id: int,
    current_user: User = Depends(require_role("volunteer", "both")),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not volunteer:
        volunteer = Volunteer(user_id=current_user.id)
        db.add(volunteer)
        db.commit()
        db.refresh(volunteer)

    existing = (
        db.query(EventParticipation)
        .filter(
            EventParticipation.event_id == event_id,
            EventParticipation.volunteer_id == volunteer.id,
        )
        .first()
    )
    if existing:
        if existing.status == "registered":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already registered for this event",
            )
        existing.status = "registered"
        db.commit()
        db.refresh(existing)
        return existing

    participation = EventParticipation(
        event_id=event_id,
        volunteer_id=volunteer.id,
        status="registered",
    )
    db.add(participation)
    db.commit()
    db.refresh(participation)
    return participation


@router.delete("/{event_id}/participate")
def cancel_event_participation(
    event_id: int,
    current_user: User = Depends(require_role("volunteer", "both")),
    db: Session = Depends(get_db),
):
    volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participation not found",
        )

    participation = (
        db.query(EventParticipation)
        .filter(
            EventParticipation.event_id == event_id,
            EventParticipation.volunteer_id == volunteer.id,
        )
        .first()
    )
    if not participation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participation not found",
        )

    db.delete(participation)
    db.commit()
    return {"message": "Participation cancelled successfully"}
