from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_orphanage
from app.db.database import get_db
from app.models.orphanage import Orphanage
from app.models.request import ItemRequest
from app.schemas.request import (
    ItemRequestCreate,
    ItemRequestUpdate,
    ItemRequestResponse,
)

router = APIRouter(
    prefix="/requests",
    tags=["Requests"],
)


@router.post("", response_model=ItemRequestResponse, status_code=status.HTTP_201_CREATED)
def create_item_request(
    data: ItemRequestCreate,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    item_request = ItemRequest(
        orphanage_id=orphanage.id,
        title=data.title,
        description=data.description,
        item_type=data.item_type,
        quantity_needed=data.quantity_needed,
        urgency=data.urgency,
        status="open",
    )
    db.add(item_request)
    db.commit()
    db.refresh(item_request)
    return item_request


@router.get("", response_model=list[ItemRequestResponse])
def list_item_requests(
    status: str | None = None,
    orphanage_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(ItemRequest)
    if status:
        query = query.filter(ItemRequest.status == status)
    if orphanage_id:
        query = query.filter(ItemRequest.orphanage_id == orphanage_id)
    return query.order_by(ItemRequest.created_at.desc()).all()


@router.get("/my", response_model=list[ItemRequestResponse])
def get_my_requests(
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    return (
        db.query(ItemRequest)
        .filter(ItemRequest.orphanage_id == orphanage.id)
        .order_by(ItemRequest.created_at.desc())
        .all()
    )


@router.get("/{request_id}", response_model=ItemRequestResponse)
def get_item_request(
    request_id: int,
    db: Session = Depends(get_db),
):
    item_request = db.query(ItemRequest).filter(ItemRequest.id == request_id).first()
    if not item_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item request not found",
        )
    return item_request


@router.put("/{request_id}", response_model=ItemRequestResponse)
def update_item_request(
    request_id: int,
    data: ItemRequestUpdate,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    item_request = db.query(ItemRequest).filter(ItemRequest.id == request_id).first()
    if not item_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item request not found",
        )

    if item_request.orphanage_id != orphanage.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this request",
        )

    if data.title is not None:
        item_request.title = data.title
    if data.description is not None:
        item_request.description = data.description
    if data.item_type is not None:
        item_request.item_type = data.item_type
    if data.quantity_needed is not None:
        item_request.quantity_needed = data.quantity_needed
    if data.urgency is not None:
        item_request.urgency = data.urgency
    if data.status is not None:
        item_request.status = data.status

    item_request.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item_request)
    return item_request


@router.delete("/{request_id}")
def delete_item_request(
    request_id: int,
    orphanage: Orphanage = Depends(get_current_orphanage),
    db: Session = Depends(get_db),
):
    item_request = db.query(ItemRequest).filter(ItemRequest.id == request_id).first()
    if not item_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item request not found",
        )

    if item_request.orphanage_id != orphanage.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this request",
        )

    db.delete(item_request)
    db.commit()
    return {"message": "Request deleted successfully"}
