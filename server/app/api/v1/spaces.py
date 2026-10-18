import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.space import Space
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceResponse
from app.core.dependencies import get_current_user_optional
from app.models.organization import StaffMember

router = APIRouter(prefix="/spaces", tags=["Spaces"])


@router.get("", response_model=List[SpaceResponse])
def get_spaces(
    location: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    query = select(Space)
    if location and location != "All Locations":
        query = query.where(Space.location_name == location)
    if is_active is not None:
        query = query.where(Space.is_active == is_active)
    if type and type != "All":
        query = query.where(Space.type == type)
    query = query.order_by(Space.name.asc())
    return list(db.execute(query).scalars().all())


@router.post("", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
def create_space(
    space_in: SpaceCreate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    space_id = space_in.id or f"spc-{uuid.uuid4().hex[:8]}"
    space = Space(
        id=space_id,
        location_id=space_in.location_id,
        location_name=space_in.location_name,
        name=space_in.name,
        type=space_in.type,
        capacity=space_in.capacity,
        hourly_rate_cents=space_in.hourly_rate_cents,
        amenities=space_in.amenities,
        floor_or_zone=space_in.floor_or_zone,
        is_active=space_in.is_active,
        notes=space_in.notes,
    )
    db.add(space)
    db.commit()
    db.refresh(space)
    return space


@router.get("/{space_id}", response_model=SpaceResponse)
def get_space(
    space_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    space = db.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
    return space


@router.put("/{space_id}", response_model=SpaceResponse)
def update_space(
    space_id: str,
    space_in: SpaceUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    space = db.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    update_data = space_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(space, key, value)

    db.commit()
    db.refresh(space)
    return space


@router.patch("/{space_id}/toggle-active", response_model=SpaceResponse)
def toggle_space_active(
    space_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    space = db.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    space.is_active = not space.is_active
    db.commit()
    db.refresh(space)
    return space


@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_space(
    space_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[StaffMember] = Depends(get_current_user_optional),
):
    space = db.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
    db.delete(space)
    db.commit()
    return None
