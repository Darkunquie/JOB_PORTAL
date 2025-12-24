from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile
from app.users.schemas import ProfileUpdate, ProfileResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return profile


@router.put("/profile", response_model=ProfileResponse)
def update_my_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.

    Only updates fields that are provided in the request.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Update only provided fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.get("/profile/{user_id}", response_model=ProfileResponse)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get any user's public profile.

    This is a public endpoint for viewing other users' profiles.
    """
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return profile
