"""add performance indexes

Revision ID: 003
Revises: 002
Create Date: 2025-12-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add indexes for frequently queried columns
    # Note: Some indexes already exist from model definitions (marked with index=True)
    # We only create composite indexes and missing single-column indexes

    # Users table - email, role, is_active likely don't have indexes yet
    try:
        op.create_index('idx_users_role', 'users', ['role'], if_not_exists=True)
    except:
        pass
    try:
        op.create_index('idx_users_is_active', 'users', ['is_active'], if_not_exists=True)
    except:
        pass

    # Companies table indexes
    try:
        op.create_index('idx_companies_owner_id', 'companies', ['owner_id'], if_not_exists=True)
    except:
        pass

    # Jobs table - composite index for common query pattern (company + status)
    try:
        op.create_index('idx_jobs_company_status', 'jobs', ['company_id', 'status'], if_not_exists=True)
    except:
        pass

    # Applications table indexes
    try:
        op.create_index('idx_applications_user_id', 'applications', ['user_id'], if_not_exists=True)
    except:
        pass
    try:
        op.create_index('idx_applications_job_id', 'applications', ['job_id'], if_not_exists=True)
    except:
        pass
    try:
        op.create_index('idx_applications_status', 'applications', ['status'], if_not_exists=True)
    except:
        pass
    # Composite indexes for common query patterns
    try:
        op.create_index('idx_applications_user_status', 'applications', ['user_id', 'status'], if_not_exists=True)
    except:
        pass
    try:
        op.create_index('idx_applications_job_status', 'applications', ['job_id', 'status'], if_not_exists=True)
    except:
        pass


def downgrade() -> None:
    # Remove indexes in reverse order (with error handling)
    indexes_to_drop = [
        ('idx_applications_job_status', 'applications'),
        ('idx_applications_user_status', 'applications'),
        ('idx_applications_status', 'applications'),
        ('idx_applications_job_id', 'applications'),
        ('idx_applications_user_id', 'applications'),
        ('idx_jobs_company_status', 'jobs'),
        ('idx_companies_owner_id', 'companies'),
        ('idx_users_is_active', 'users'),
        ('idx_users_role', 'users'),
    ]

    for idx_name, table_name in indexes_to_drop:
        try:
            op.drop_index(idx_name, table_name, if_exists=True)
        except:
            pass
