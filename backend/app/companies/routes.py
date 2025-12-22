from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Company, UserRole
from app.companies.schemas import CompanyCreate, CompanyUpdate, CompanyResponse
from app.auth.permissions import require_roles
from app.middleware.rate_limiter import limiter
from app.middleware.rate_limits import COMPANY_CREATE_LIMIT, PUBLIC_READ_LIMIT
from app.cache import invalidate_cache

router = APIRouter(prefix="/companies", tags=["Companies"])


# --------------------------------------------------
# Create company (RATE LIMITED)
# --------------------------------------------------
@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(COMPANY_CREATE_LIMIT)
def create_company(
    request: Request,   # ✅ REQUIRED for SlowAPI
    company: CompanyCreate,
    current_user: User = Depends(require_roles([UserRole.admin, UserRole.employer])),
    db: Session = Depends(get_db),
):
    new_company = Company(
        **company.dict(),
        owner_id=current_user.id
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    invalidate_cache("companies")
    return new_company


# --------------------------------------------------
# List companies (RATE LIMITED)
# --------------------------------------------------
@router.get("", response_model=List[CompanyResponse])
@limiter.limit(PUBLIC_READ_LIMIT)
def list_companies(
    request: Request,   # ✅ REQUIRED for SlowAPI
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return db.query(Company).offset(skip).limit(limit).all()


# --------------------------------------------------
# My companies (NO rate limit → no request needed)
# --------------------------------------------------
@router.get("/my-companies", response_model=List[CompanyResponse])
def my_companies(
    current_user: User = Depends(require_roles([UserRole.admin, UserRole.employer])),
    db: Session = Depends(get_db),
):
    return (
        db.query(Company)
        .filter(Company.owner_id == current_user.id)
        .all()
    )
