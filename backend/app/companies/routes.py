from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Company, UserRole
from app.companies.schemas import CompanyCreate, CompanyUpdate, CompanyResponse
from app.auth.dependencies import get_current_user, require_employer
from app.cache import invalidate_cache

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    company: CompanyCreate,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db)
):
    """
    Create a new company.

    Only employers and admins can create companies.
    """
    new_company = Company(
        name=company.name,
        description=company.description,
        owner_id=current_user.id
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    # Invalidate companies cache after creation
    invalidate_cache("companies")

    return new_company


@router.get("", response_model=List[CompanyResponse])
def list_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all companies (public endpoint).

    Supports pagination via skip and limit parameters.
    """
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies


@router.get("/my-companies", response_model=List[CompanyResponse])
def get_my_companies(
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db)
):
    """
    Get all companies owned by the current user.

    Only accessible by employers and admins.
    """
    companies = db.query(Company).filter(Company.owner_id == current_user.id).all()
    return companies


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific company by ID (public endpoint).
    """
    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a company.

    Only the company owner or admin can update the company.
    """
    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Check ownership or admin role
    if company.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this company"
        )

    # Update only provided fields
    update_data = company_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)

    # Invalidate companies cache after update
    invalidate_cache("companies")

    return company


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a company.

    Only the company owner or admin can delete the company.
    This will cascade delete all associated jobs and applications.
    """
    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Check ownership or admin role
    if company.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this company"
        )

    db.delete(company)
    db.commit()

    # Invalidate companies cache after deletion
    invalidate_cache("companies")

    return None
