#!/usr/bin/env python3
"""
SAFE Seed Data Script - Development Only
Creates sample data for testing (DISABLED in production for security)
"""
import os
import sys
from app.database import SessionLocal
from app.models import User, Company, Job, UserRole, JobStatus, EmploymentType, Profile
from app.auth.security import get_password_hash


def check_environment():
    """Verify we're not in production"""
    environment = os.getenv('ENVIRONMENT', 'development').lower()

    if environment == 'production':
        print("=" * 70)
        print("❌ SECURITY ERROR: Cannot run seed data in production!")
        print("=" * 70)
        print()
        print("This script creates test accounts with known passwords.")
        print("Running this in production would be a CRITICAL security vulnerability.")
        print()
        print("For production:")
        print("  1. Use create_admin_secure.py to create admin users")
        print("  2. Let real users register through the application")
        print("  3. Never use test/seed data")
        print()
        sys.exit(1)

    print(f"✅ Environment check passed: {environment}")
    return environment


def seed_database():
    """Seed database with sample data for development/testing"""

    print()
    print("=" * 70)
    print("⚠️  WARNING: DEVELOPMENT SEED DATA")
    print("=" * 70)
    print()
    print("This will create test accounts with known passwords:")
    print("  • 3 employer accounts (password: TestPass123!)")
    print("  • 3 companies")
    print("  • 9 sample job postings")
    print()
    print("These accounts are for TESTING ONLY and should NEVER be used in production.")
    print()

    response = input("Continue? (yes/no): ").strip().lower()
    if response != 'yes':
        print("Aborted.")
        sys.exit(0)

    db = SessionLocal()

    try:
        print()
        print("🌱 Seeding database with sample data...")

        # Clear existing test data (keep admin)
        db.query(Job).delete()
        db.query(Company).delete()
        db.query(Profile).filter(
            Profile.user_id.in_(
                db.query(User.id).filter(User.role == UserRole.employer)
            )
        ).delete(synchronize_session='fetch')
        db.query(User).filter(User.role == UserRole.employer).delete()
        db.commit()

        print("✅ Cleared existing seed data")

        # Test password (ONLY for development)
        test_password = "TestPass123!"

        # Create employer users
        employers = [
            {
                "email": "employer1@example.com",
                "full_name": "Test Employer 1",
                "company_name": "Tech Corp",
                "company_desc": "Leading technology company specializing in cloud solutions and AI"
            },
            {
                "email": "employer2@example.com",
                "full_name": "Test Employer 2",
                "company_name": "Startup XYZ",
                "company_desc": "Fast-growing startup building the next generation of mobile apps"
            },
            {
                "email": "employer3@example.com",
                "full_name": "Test Employer 3",
                "company_name": "MegaCorp Industries",
                "company_desc": "Global leader in manufacturing and industrial automation"
            }
        ]

        # Sample jobs data
        jobs_data = [
            {
                "title": "Senior Full Stack Developer",
                "description": "Build scalable web applications using React and Node.js",
                "location": "San Francisco, CA",
                "employment_type": EmploymentType.full_time,
                "salary_min": 1000000,
                "salary_max": 1500000,
                "required_skills": "React, Node.js, PostgreSQL, TypeScript, Docker"
            },
            {
                "title": "DevOps Engineer",
                "description": "Manage cloud infrastructure and deployment pipelines",
                "location": "Remote",
                "employment_type": EmploymentType.full_time,
                "salary_min": 900000,
                "salary_max": 1300000,
                "required_skills": "AWS, Kubernetes, Docker, Terraform, Jenkins"
            },
            {
                "title": "Product Designer",
                "description": "Create beautiful and intuitive user experiences",
                "location": "New York, NY",
                "employment_type": EmploymentType.full_time,
                "salary_min": 750000,
                "salary_max": 1150000,
                "required_skills": "Figma, UI/UX Design, Prototyping, User Research"
            },
            {
                "title": "Mobile Developer (iOS)",
                "description": "Build amazing iOS applications using Swift",
                "location": "Austin, TX",
                "employment_type": EmploymentType.full_time,
                "salary_min": 850000,
                "salary_max": 1250000,
                "required_skills": "Swift, SwiftUI, iOS SDK, RESTful APIs"
            },
            {
                "title": "Data Scientist",
                "description": "Analyze data and build ML models",
                "location": "Seattle, WA",
                "employment_type": EmploymentType.full_time,
                "salary_min": 1100000,
                "salary_max": 1600000,
                "required_skills": "Python, Machine Learning, TensorFlow, Pandas, SQL"
            },
            {
                "title": "Frontend Developer Intern",
                "description": "Summer internship for web development",
                "location": "Remote",
                "employment_type": EmploymentType.internship,
                "salary_min": 20000,
                "salary_max": 30000,
                "required_skills": "JavaScript, React, HTML, CSS"
            },
            {
                "title": "Backend Engineer",
                "description": "Build scalable APIs with Python and FastAPI",
                "location": "Boston, MA",
                "employment_type": EmploymentType.full_time,
                "salary_min": 950000,
                "salary_max": 1350000,
                "required_skills": "Python, FastAPI, PostgreSQL, Redis, Microservices"
            },
            {
                "title": "QA Engineer",
                "description": "Ensure product quality through automated testing",
                "location": "Denver, CO",
                "employment_type": EmploymentType.full_time,
                "salary_min": 650000,
                "salary_max": 1000000,
                "required_skills": "Test Automation, Selenium, Jest, API Testing"
            },
            {
                "title": "Project Manager",
                "description": "Lead cross-functional teams to deliver projects",
                "location": "Chicago, IL",
                "employment_type": EmploymentType.full_time,
                "salary_min": 800000,
                "salary_max": 1100000,
                "required_skills": "Project Management, Agile, Scrum, JIRA, Communication"
            }
        ]

        # Create employers and companies
        created_companies = []
        for emp_data in employers:
            # Create employer user
            employer = User(
                email=emp_data["email"],
                password_hash=get_password_hash(test_password),
                role=UserRole.employer,
                is_active=True
            )
            db.add(employer)
            db.flush()

            # Create profile
            profile = Profile(
                user_id=employer.id,
                full_name=emp_data["full_name"]
            )
            db.add(profile)

            # Create company
            company = Company(
                name=emp_data["company_name"],
                description=emp_data["company_desc"],
                owner_id=employer.id
            )
            db.add(company)
            db.flush()
            created_companies.append(company)

            print(f"✅ Created employer: {emp_data['email']} with company: {emp_data['company_name']}")

        db.commit()

        # Create jobs - distribute across companies
        for idx, job_data in enumerate(jobs_data):
            company = created_companies[idx % len(created_companies)]

            job = Job(
                title=job_data["title"],
                description=job_data["description"],
                location=job_data["location"],
                employment_type=job_data["employment_type"],
                salary_min=job_data["salary_min"],
                salary_max=job_data["salary_max"],
                required_skills=job_data["required_skills"],
                company_id=company.id,
                status=JobStatus.open
            )
            db.add(job)
            print(f"✅ Created job: {job_data['title']} at {company.name}")

        db.commit()

        print()
        print("=" * 70)
        print("🎉 DATABASE SEEDED SUCCESSFULLY!")
        print("=" * 70)
        print(f"Created: {len(employers)} employers | {len(created_companies)} companies | {len(jobs_data)} jobs")
        print()
        print("📝 Test Employer Login Credentials:")
        print("-" * 70)
        for emp in employers:
            print(f"   Email: {emp['email']}")
        print(f"   Password (all accounts): {test_password}")
        print()
        print("⚠️  These are TEST accounts - DO NOT use in production!")
        print()

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    # Check environment before proceeding
    check_environment()

    # Seed database
    seed_database()
