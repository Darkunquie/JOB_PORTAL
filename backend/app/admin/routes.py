from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Profile, UserRole
from app.admin.schemas import UserListResponse, UserStatusUpdate, UserRoleUpdate
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserListResponse])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by email or name"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users in the system.

    Admin-only endpoint with filtering and search capabilities.
    """
    query = db.query(
        User.id,
        User.email,
        User.role,
        User.is_active,
        User.created_at,
        Profile.full_name
    ).outerjoin(Profile, User.id == Profile.user_id)

    # Apply filters
    if role:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_term)) | (Profile.full_name.ilike(search_term))
        )

    # Order by creation date
    query = query.order_by(User.created_at.desc())

    # Pagination
    users = query.offset(skip).limit(limit).all()

    return [
        UserListResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            full_name=user.full_name
        )
        for user in users
    ]


@router.put("/users/{user_id}/status", response_model=UserListResponse)
def update_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Enable or disable a user account.

    Admin-only endpoint. Cannot disable your own account.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from disabling themselves
    if user.id == current_user.id and not status_update.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot disable your own account"
        )

    user.is_active = status_update.is_active
    db.commit()
    db.refresh(user)

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    return UserListResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        full_name=profile.full_name if profile else None
    )


@router.put("/users/{user_id}/role", response_model=UserListResponse)
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Change a user's role.

    Admin-only endpoint. Cannot change your own role.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from changing their own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )

    user.role = role_update.role
    db.commit()
    db.refresh(user)

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    return UserListResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        full_name=profile.full_name if profile else None
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Permanently delete a user account.

    Admin-only endpoint. Cannot delete your own account.
    Cascades to all related data (profile, companies, applications).
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    db.delete(user)
    db.commit()

    return None


@router.get("/pending-employers", response_model=List[UserListResponse])
def get_pending_employers(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all pending employer registrations awaiting approval.

    Admin-only endpoint.
    """
    pending_employers = db.query(
        User.id,
        User.email,
        User.role,
        User.is_active,
        User.created_at,
        Profile.full_name
    ).outerjoin(Profile, User.id == Profile.user_id).filter(
        User.role == UserRole.employer,
        User.is_active == False
    ).order_by(User.created_at.desc()).all()

    return [
        UserListResponse(
            id=emp.id,
            email=emp.email,
            role=emp.role,
            is_active=emp.is_active,
            created_at=emp.created_at,
            full_name=emp.full_name
        )
        for emp in pending_employers
    ]


@router.post("/approve-employer/{user_id}", response_model=UserListResponse)
def approve_employer(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Approve an employer registration.

    Admin-only endpoint. Sets employer account to active.
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.role == UserRole.employer
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer not found"
        )

    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employer is already approved"
        )

    user.is_active = True
    db.commit()
    db.refresh(user)

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    return UserListResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        full_name=profile.full_name if profile else None
    )


@router.delete("/reject-employer/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def reject_employer(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Reject an employer registration and delete the account.

    Admin-only endpoint. Permanently deletes the user account.
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.role == UserRole.employer
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer not found"
        )

    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reject an already approved employer"
        )

    db.delete(user)
    db.commit()

    return None


@router.get("/stats")
def get_platform_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get platform statistics.

    Admin-only endpoint for dashboard overview.
    """
    from app.models import Company, Job, Application

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_employers = db.query(User).filter(User.role == UserRole.employer).count()
    total_seekers = db.query(User).filter(User.role == UserRole.seeker).count()
    pending_employers = db.query(User).filter(
        User.role == UserRole.employer,
        User.is_active == False
    ).count()

    total_companies = db.query(Company).count()
    total_jobs = db.query(Job).count()
    open_jobs = db.query(Job).filter(Job.status == "open").count()

    total_applications = db.query(Application).count()
    pending_applications = db.query(Application).filter(
        Application.status == "applied"
    ).count()

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "employers": total_employers,
            "seekers": total_seekers,
            "pending_employers": pending_employers
        },
        "companies": {
            "total": total_companies
        },
        "jobs": {
            "total": total_jobs,
            "open": open_jobs
        },
        "applications": {
            "total": total_applications,
            "pending": pending_applications
        }
    }
