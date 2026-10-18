from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.organization import StaffMember
from app.schemas.auth import LoginRequest, TokenResponse, UserProfileResponse
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(StaffMember).where(StaffMember.email == login_req.email)
    ).scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # In dev seed, if no hashed_password exists or password matches default
    is_valid = False
    if user.hashed_password:
        is_valid = verify_password(login_req.password, user.hashed_password)
    elif login_req.password == "WorkNest123!":
        is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user),
    )


@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: StaffMember = Depends(get_current_user)):
    return UserProfileResponse.model_validate(current_user)
