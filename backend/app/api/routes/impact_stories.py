from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_orphanage
from app.db.database import get_db
from app.models.impact_story import ImpactStory
from app.models.orphanage import Orphanage
from app.schemas.impact_story import (
    ImpactStoryCreate,
    ImpactStoryUpdate,
    ImpactStoryResponse,
)

router = APIRouter(
    prefix="/impact-stories",
    tags=["Impact Stories"],
)


@router.post("", response_model=ImpactStoryResponse, status_code=status.HTTP_201_CREATED)
def create_impact_story(
    data: ImpactStoryCreate,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    story = ImpactStory(
        orphanage_id=orphanage.id,
        title=data.title,
        content=data.content,
        image_url=data.image_url,
    )
    db.add(story)
    db.commit()
    db.refresh(story)
    return story


@router.get("", response_model=list[ImpactStoryResponse])
def list_impact_stories(
    orphanage_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(ImpactStory)
    if orphanage_id:
        query = query.filter(ImpactStory.orphanage_id == orphanage_id)
    return query.order_by(ImpactStory.created_at.desc()).all()


@router.get("/{story_id}", response_model=ImpactStoryResponse)
def get_impact_story(
    story_id: int,
    db: Session = Depends(get_db),
):
    story = db.query(ImpactStory).filter(ImpactStory.id == story_id).first()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impact story not found",
        )
    return story


@router.put("/{story_id}", response_model=ImpactStoryResponse)
def update_impact_story(
    story_id: int,
    data: ImpactStoryUpdate,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    story = db.query(ImpactStory).filter(ImpactStory.id == story_id).first()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impact story not found",
        )

    if story.orphanage_id != orphanage.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this impact story",
        )

    if data.title is not None:
        story.title = data.title
    if data.content is not None:
        story.content = data.content
    if data.image_url is not None:
        story.image_url = data.image_url

    db.commit()
    db.refresh(story)
    return story


@router.delete("/{story_id}")
def delete_impact_story(
    story_id: int,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    story = db.query(ImpactStory).filter(ImpactStory.id == story_id).first()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impact story not found",
        )

    if story.orphanage_id != orphanage.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this impact story",
        )

    db.delete(story)
    db.commit()
    return {"message": "Impact story deleted successfully"}
