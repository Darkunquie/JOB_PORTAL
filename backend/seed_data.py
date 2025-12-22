"""
⚠️ WARNING: SAMPLE DATA SCRIPT - FOR DEVELOPMENT ONLY!

This script adds dummy/sample data to the database.
DO NOT RUN THIS IN PRODUCTION!

This is only for:
- Local development
- Testing
- Demos

For production, use:
- docker-compose exec backend python init_db.py (create tables)
- docker-compose exec backend python create_user.py (create admin)
"""

import sys

print("\n" + "="*60)
print("⚠️  WARNING: SAMPLE DATA SCRIPT")
print("="*60)
print("\nThis script adds DUMMY DATA for development/testing only.")
print("DO NOT use this in production!")
print("\nThis will create:")
print("  - 3 sample employer accounts")
print("  - 3 sample companies")
print("  - 9 sample job listings")
print("\n" + "="*60)

response = input("\n⚠️  Continue? (type 'YES' to confirm): ").strip()

if response != "YES":
    print("\n❌ Cancelled. No data was added.")
    print("="*60 + "\n")
    sys.exit(0)

from app.database import SessionLocal
from app.models import User, Company, Job, UserRole, JobStatus, EmploymentType
from app.auth.security import get_password_hash

db = SessionLocal()

print("\n🌱 Seeding database with sample data...")

# Clear existing data (except admin)
db.query(Job).delete()
db.query(Company).delete()
db.query(User).filter(User.role == UserRole.employer).delete()
db.commit()

print("✅ Cleared existing seed data")

# Create employer users
employers = [
    {
        "email": "hr@techcorp.com",
        "password": "Password123!",
        "full_name": "Tech Corp HR",
        "company_name": "Tech Corp",
        "company_desc": "Leading technology company specializing in cloud solutions and AI"
    },
    {
        "email": "hiring@startupxyz.com",
        "password": "Password123!",
        "full_name": "Startup XYZ Recruiter",
        "company_name": "Startup XYZ",
        "company_desc": "Fast-growing startup building the next generation of mobile apps"
    },
    {
        "email": "jobs@megacorp.com",
        "password": "Password123!",
        "full_name": "MegaCorp Talent Team",
        "company_name": "MegaCorp Industries",
        "company_desc": "Global leader in manufacturing and industrial automation"
    }
]

# Sample jobs data
jobs_data = [
    {
        "title": "Senior Full Stack Developer",
        "description": """We are looking for an experienced Full Stack Developer to join our growing team.

**About the Role:**
You will work on cutting-edge web applications that serve millions of users. As a senior member of the team, you'll architect solutions, mentor junior developers, and drive technical decisions.

**Responsibilities:**
- Design and implement scalable web applications using React and Node.js
- Build RESTful APIs and microservices
- Optimize database queries and application performance
- Collaborate with product managers and designers
- Mentor junior developers and conduct code reviews
- Participate in architectural decisions

**Requirements:**
- 5+ years of experience in full stack development
- Strong proficiency in React, Node.js, and PostgreSQL
- Experience with TypeScript and modern JavaScript
- Knowledge of Docker and containerization
- Understanding of CI/CD pipelines
- Excellent problem-solving skills

**Benefits:**
- Competitive salary ($120K - $180K)
- Health, dental, and vision insurance
- 401(k) with company match
- Unlimited PTO
- Remote work flexibility
- Professional development budget""",
        "location": "San Francisco, CA",
        "employment_type": EmploymentType.full_time,
        "salary_min": 1000000,
        "salary_max": 1500000,
        "required_skills": "React, Node.js, PostgreSQL, TypeScript, Docker"
    },
    {
        "title": "DevOps Engineer",
        "description": """Join our infrastructure team to build and maintain scalable cloud infrastructure.

**About the Role:**
We're looking for a DevOps Engineer to help us build and scale our cloud infrastructure. You'll work with cutting-edge technologies and be responsible for ensuring our systems are reliable, secure, and performant.

**What You'll Do:**
- Design and implement CI/CD pipelines
- Manage AWS infrastructure using Infrastructure as Code (Terraform)
- Deploy and manage Kubernetes clusters
- Implement monitoring and alerting solutions
- Automate repetitive tasks and improve developer experience
- Ensure security best practices across infrastructure

**Requirements:**
- 3+ years of DevOps/SRE experience
- Strong experience with AWS (EC2, RDS, S3, Lambda)
- Proficiency with Kubernetes and Docker
- Experience with Terraform or similar IaC tools
- Knowledge of CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
- Scripting skills (Python, Bash)

**Nice to Have:**
- Experience with service mesh (Istio, Linkerd)
- Knowledge of observability tools (Prometheus, Grafana, ELK)
- AWS certifications

**Benefits:**
- Fully remote position
- Competitive salary ($110K - $160K)
- Health, dental, and vision insurance
- Home office stipend
- Learning and development budget""",
        "location": "Remote",
        "employment_type": EmploymentType.full_time,
        "salary_min": 900000,
        "salary_max": 1300000,
        "required_skills": "AWS, Kubernetes, Docker, Terraform, Jenkins"
    },
    {
        "title": "Product Designer",
        "description": "We need a creative Product Designer to craft beautiful and intuitive user experiences. You'll work closely with engineers and product managers.",
        "location": "New York, NY",
        "employment_type": EmploymentType.full_time,
        "salary_min": 750000,
        "salary_max": 1150000,
        "required_skills": "Figma, UI/UX Design, Prototyping, User Research"
    },
    {
        "title": "Mobile Developer (iOS)",
        "description": "Build amazing iOS applications using Swift and SwiftUI. Work on apps used by millions of users worldwide.",
        "location": "Austin, TX",
        "employment_type": EmploymentType.full_time,
        "salary_min": 850000,
        "salary_max": 1250000,
        "required_skills": "Swift, SwiftUI, iOS SDK, RESTful APIs"
    },
    {
        "title": "Data Scientist",
        "description": "Analyze large datasets and build machine learning models to drive business insights. Experience with Python and ML frameworks required.",
        "location": "Seattle, WA",
        "employment_type": EmploymentType.full_time,
        "salary_min": 1100000,
        "salary_max": 1600000,
        "required_skills": "Python, Machine Learning, TensorFlow, Pandas, SQL"
    },
    {
        "title": "Frontend Developer Intern",
        "description": "Summer internship opportunity for students passionate about web development. Learn from experienced engineers while building real features.",
        "location": "Remote",
        "employment_type": EmploymentType.internship,
        "salary_min": 20000,
        "salary_max": 30000,
        "required_skills": "JavaScript, React, HTML, CSS"
    },
    {
        "title": "Backend Engineer",
        "description": "Build scalable APIs and microservices using Python and FastAPI. Work on systems handling millions of requests per day.",
        "location": "Boston, MA",
        "employment_type": EmploymentType.full_time,
        "salary_min": 950000,
        "salary_max": 1350000,
        "required_skills": "Python, FastAPI, PostgreSQL, Redis, Microservices"
    },
    {
        "title": "Quality Assurance Engineer",
        "description": "Ensure the quality of our products through automated testing and manual QA. Experience with testing frameworks required.",
        "location": "Denver, CO",
        "employment_type": EmploymentType.full_time,
        "salary_min": 650000,
        "salary_max": 1000000,
        "required_skills": "Test Automation, Selenium, Jest, API Testing"
    },
    {
        "title": "Project Manager",
        "description": "Lead cross-functional teams to deliver projects on time and within budget. Agile/Scrum experience preferred.",
        "location": "Chicago, IL",
        "employment_type": EmploymentType.full_time,
        "salary_min": 800000,
        "salary_max": 1100000,
        "required_skills": "Project Management, Agile, Scrum, JIRA, Communication"
    }
]

# Create employers and companies
created_companies = []
for idx, emp_data in enumerate(employers):
    # Create employer user
    employer = User(
        email=emp_data["email"],
        password_hash=get_password_hash(emp_data["password"]),
        role=UserRole.employer,
        is_active=True
    )
    db.add(employer)
    db.flush()

    # Create profile
    from app.models import Profile
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
db.close()

print("\n🎉 Database seeded successfully!")
print(f"📊 Created {len(employers)} employers, {len(created_companies)} companies, and {len(jobs_data)} jobs")
print("\n📝 Employer logins:")
for emp in employers:
    print(f"   - {emp['email']} / {emp['password']}")
