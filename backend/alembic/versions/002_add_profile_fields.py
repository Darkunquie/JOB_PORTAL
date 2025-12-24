"""add profile fields

Revision ID: 002
Revises: 001
Create Date: 2025-12-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to profiles table
    op.add_column('profiles', sa.Column('profile_image_url', sa.String(500), nullable=True))
    op.add_column('profiles', sa.Column('date_of_birth', sa.String(50), nullable=True))
    op.add_column('profiles', sa.Column('phone', sa.String(50), nullable=True))
    op.add_column('profiles', sa.Column('location', sa.String(255), nullable=True))
    op.add_column('profiles', sa.Column('education_text', sa.Text(), nullable=True))
    op.add_column('profiles', sa.Column('linkedin_url', sa.String(500), nullable=True))
    op.add_column('profiles', sa.Column('github_url', sa.String(500), nullable=True))
    op.add_column('profiles', sa.Column('portfolio_url', sa.String(500), nullable=True))


def downgrade() -> None:
    # Remove the columns in reverse order
    op.drop_column('profiles', 'portfolio_url')
    op.drop_column('profiles', 'github_url')
    op.drop_column('profiles', 'linkedin_url')
    op.drop_column('profiles', 'education_text')
    op.drop_column('profiles', 'location')
    op.drop_column('profiles', 'phone')
    op.drop_column('profiles', 'date_of_birth')
    op.drop_column('profiles', 'profile_image_url')
