# Job Portal

A full-stack job portal application built with FastAPI (Python) backend and React (Vite) frontend. This platform enables job seekers to find and apply for jobs, employers to post jobs and manage applications, and administrators to oversee the entire system.

## Features

### For Job Seekers
- Create and manage professional profiles
- Browse and search job listings
- Apply for jobs with resume upload
- Track application status
- View application history

### For Employers
- Post and manage job listings
- Review and manage job applications
- Company profile management
- Application tracking and filtering

### For Administrators
- User management and approval system
- System-wide oversight
- User role management
- Platform analytics

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT tokens
- **Password Hashing**: bcrypt
- **Caching**: Redis (optional)
- **File Storage**: Local/Cloud storage support

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **State Management**: Context API

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Process Manager**: Uvicorn

## Prerequisites

- Docker and Docker Compose (recommended)
- OR:
  - Python 3.10+
  - Node.js 16+
  - PostgreSQL 13+

## Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/Darkunquie/JOB_PORTAL.git
cd JOB_PORTAL
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration:
```env
# Database
POSTGRES_USER=jobportal
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=jobportal

# Backend
DATABASE_URL=postgresql://jobportal:your_secure_password@db:5432/jobportal
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
VITE_API_URL=http://localhost:8000
```

4. Start the application:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Create admin user (optional):
```bash
python create_admin.py
```

6. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
JOB_PORTAL/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── admin/            # Admin routes and schemas
│   │   ├── applications/     # Job application logic
│   │   ├── auth/             # Authentication & authorization
│   │   ├── companies/        # Company management
│   │   ├── jobs/             # Job posting logic
│   │   ├── middleware/       # Custom middleware
│   │   ├── storage/          # File handling
│   │   ├── users/            # User management
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database connection
│   │   ├── models.py         # SQLAlchemy models
│   │   └── main.py           # FastAPI app entry
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts with role-based access
- `companies` - Employer company profiles
- `jobs` - Job postings
- `applications` - Job applications
- `profiles` - Job seeker profiles

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Scripts

### Backend
```bash
# Run migrations
alembic upgrade head

# Create migration
alembic revision --autogenerate -m "description"

# Run development server
uvicorn app.main:app --reload

# Create admin user
python create_admin.py

# Seed sample data
python seed_data.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment

1. Update environment variables in `.env` for production
2. Build and deploy using Docker Compose:
```bash
./deploy-production.sh
```

Or manually:
```bash
docker-compose -f docker-compose.yml up -d --build
```

## Environment Variables

See [.env.example](.env.example) for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (generate a secure random string)
- `VITE_API_URL` - Backend API URL for frontend

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Rate limiting middleware
- Security headers
- CORS configuration
- SQL injection prevention via SQLAlchemy ORM

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with FastAPI and React
- Styled with Tailwind CSS
- Containerized with Docker
