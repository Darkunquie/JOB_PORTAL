# Job Site Platform - System Architecture and Workflow

## System Overview

The Job Site is a comprehensive job marketplace platform built with a modern web architecture, featuring role-based access control for three distinct user types: Administrators, Employers, and Job Seekers. The system facilitates the complete job application lifecycle from job posting to candidate selection.

### Core Roles

| Role | Purpose | Access Level |
|------|---------|--------------|
| Admin | Full system control and oversight | All features, user management, employer approval |
| Employer | Post jobs and manage hiring | Company management, job posting, application review |
| Job Seeker | Find and apply to jobs | Profile management, job search, application tracking |

### Technology Stack

**Backend:**
- Framework: FastAPI with Python
- Database: SQLAlchemy ORM with PostgreSQL
- Authentication: JWT tokens with bcrypt password hashing
- File Storage: Local filesystem with organized directory structure
- Security: Rate limiting, security headers, CORS middleware

**Frontend:**
- Framework: React with Vite
- Routing: React Router v6
- State Management: Context API for authentication
- Styling: CSS with responsive design

## System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Application]
        AuthContext[Auth Context]
        Pages[Page Components]
        API_Client[API Client]
    end
    
    subgraph "Backend Layer"
        FastAPI[FastAPI Server]
        Middleware[Middleware Stack]
        Routes[Route Handlers]
        Auth[Auth Module]
    end
    
    subgraph "Security Layer"
        RateLimit[Rate Limiter]
        SecHeaders[Security Headers]
        CORS[CORS Middleware]
        JWT[JWT Authentication]
    end
    
    subgraph "Data Layer"
        ORM[SQLAlchemy ORM]
        DB[(PostgreSQL Database)]
        FileSystem[File Storage]
    end
    
    UI --> AuthContext
    AuthContext --> API_Client
    Pages --> API_Client
    API_Client --> FastAPI
    FastAPI --> Middleware
    Middleware --> RateLimit
    Middleware --> SecHeaders
    Middleware --> CORS
    Routes --> Auth
    Auth --> JWT
    Routes --> ORM
    ORM --> DB
    Routes --> FileSystem
```

## Database Schema

### Entity Relationships

```mermaid
erDiagram
    User ||--o| Profile : has
    User ||--o{ Company : owns
    User ||--o{ Application : submits
    Company ||--o{ Job : posts
    Job ||--o{ Application : receives
    
    User {
        int id PK
        string email UK
        string password_hash
        enum role
        boolean is_active
        datetime created_at
    }
    
    Profile {
        int id PK
        int user_id FK
        string full_name
        string headline
        string profile_image_url
        text experience_text
        text skills_text
        text education_text
        string linkedin_url
        string github_url
    }
    
    Company {
        int id PK
        string name
        text description
        int owner_id FK
        datetime created_at
    }
    
    Job {
        int id PK
        string title
        text description
        string location
        enum employment_type
        decimal salary_min
        decimal salary_max
        text required_skills
        int company_id FK
        enum status
        datetime created_at
    }
    
    Application {
        int id PK
        int job_id FK
        int user_id FK
        string resume_file_url
        text cover_letter
        enum status
        datetime applied_at
    }
```

### Enumeration Types

| Enum | Values | Usage |
|------|--------|-------|
| UserRole | admin, employer, seeker | User account type |
| ApplicationStatus | applied, reviewed, rejected, accepted | Application lifecycle state |
| JobStatus | open, closed | Job posting availability |
| EmploymentType | full_time, part_time, contract, internship | Job classification |

## Authentication and Authorization Workflow

### User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Auth
    participant DB
    
    User->>Frontend: Submit registration form
    Frontend->>API: POST /api/v1/auth/register
    API->>Auth: Validate input data
    Auth->>DB: Check email uniqueness
    alt Email exists
        DB-->>API: Email conflict
        API-->>Frontend: Error 400 - Email taken
    else Email available
        Auth->>Auth: Hash password (bcrypt)
        Auth->>DB: Create User record
        Auth->>DB: Create Profile record
        alt Role is Employer
            DB-->>API: User created (is_active=false)
            API-->>Frontend: Success - Pending approval
        else Role is Seeker/Admin
            DB-->>API: User created (is_active=true)
            API-->>Frontend: Success - Account active
        end
    end
```

**Key Behaviors:**
- All user types complete registration immediately
- Employers are created with `is_active = false` requiring admin approval
- Job seekers and admins are active immediately
- Profile is auto-created with the user record
- Password is hashed using bcrypt before storage

### Login and Token Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Auth
    participant DB
    
    User->>Frontend: Enter credentials
    Frontend->>API: POST /api/v1/auth/login
    API->>DB: Query user by email
    DB-->>API: User record
    API->>Auth: Verify password (bcrypt)
    alt Invalid credentials
        Auth-->>API: Verification failed
        API-->>Frontend: Error 401 - Invalid credentials
    else Valid credentials
        alt User inactive
            API-->>Frontend: Error 403 - Account disabled
        else User active
            Auth->>Auth: Generate JWT token
            API->>Frontend: Set HttpOnly cookie
            API-->>Frontend: Return token + user data
            Frontend->>Frontend: Store token in localStorage
            Frontend->>Frontend: Store user in context
            Frontend->>API: GET /api/v1/auth/me
            API-->>Frontend: Current user details
        end
    end
```

**Security Features:**
- Dual token storage: HttpOnly cookie (XSS protection) + localStorage (API compatibility)
- JWT tokens contain user ID in subject claim
- Token expiration: 24 hours for access tokens, 7 days for refresh tokens
- Failed login does not reveal whether email exists

### Authorization Middleware

```mermaid
flowchart TD
    Start[Incoming Request] --> HasToken{Token Present?}
    HasToken -->|No| Return401[Return 401 Unauthorized]
    HasToken -->|Yes| DecodeToken[Decode JWT Token]
    DecodeToken --> TokenValid{Token Valid?}
    TokenValid -->|No| Return401
    TokenValid -->|Yes| GetUser[Query User from DB]
    GetUser --> UserExists{User Found?}
    UserExists -->|No| Return401
    UserExists -->|Yes| CheckActive{User Active?}
    CheckActive -->|No| Return403[Return 403 Forbidden]
    CheckActive -->|Yes| CheckRole{Role Required?}
    CheckRole -->|No| AllowAccess[Allow Access]
    CheckRole -->|Yes| HasRole{User Has Role?}
    HasRole -->|No| Return403
    HasRole -->|Yes| AllowAccess
```

**Dependency Functions:**
- `get_current_user`: Validates token and returns user (any authenticated user)
- `require_admin`: Requires admin role
- `require_employer`: Requires employer or admin role
- `require_seeker`: Requires seeker or admin role

## Core Business Workflows

### Job Seeker Journey

```mermaid
flowchart TD
    Start[Register as Seeker] --> Login[Login to Platform]
    Login --> Profile[Update Profile]
    Profile --> Search[Search Jobs]
    Search --> Filter{Apply Filters}
    Filter --> Results[View Job Listings]
    Results --> Detail[View Job Details]
    Detail --> Apply{Apply Decision}
    Apply -->|Yes| Upload[Upload Resume]
    Upload --> CoverLetter[Write Cover Letter]
    CoverLetter --> Submit[Submit Application]
    Submit --> Track[Track Applications]
    Track --> Status{Application Status}
    Status -->|Applied| Wait1[Wait for Review]
    Status -->|Reviewed| Wait2[Under Consideration]
    Status -->|Accepted| Success[Accepted for Interview]
    Status -->|Rejected| Rejected[Application Declined]
    Apply -->|No| Search
    Rejected --> Search
```

**Key Features:**
- Full-text search across job titles and descriptions
- Advanced filtering: location, employment type, salary range, skills
- Resume upload with validation (PDF, DOC, DOCX, max 5MB)
- Duplicate application prevention
- Real-time application status tracking

### Employer Journey

```mermaid
flowchart TD
    Start[Register as Employer] --> Pending[Account Pending]
    Pending --> AdminReview{Admin Reviews}
    AdminReview -->|Rejected| Deleted[Account Deleted]
    AdminReview -->|Approved| Active[Account Activated]
    Active --> Login[Login to Platform]
    Login --> CreateCompany[Create Company Profile]
    CreateCompany --> PostJob[Post Job Opening]
    PostJob --> Monitor[Monitor Applications]
    Monitor --> Review[Review Applicants]
    Review --> Decision{Hiring Decision}
    Decision -->|Review| UpdateStatus1[Set Status: Reviewed]
    Decision -->|Accept| UpdateStatus2[Set Status: Accepted]
    Decision -->|Reject| UpdateStatus3[Set Status: Rejected]
    UpdateStatus1 --> Monitor
    UpdateStatus2 --> Contact[Contact Candidate]
    UpdateStatus3 --> Monitor
    Contact --> Close{Job Filled?}
    Close -->|Yes| CloseJob[Close Job Posting]
    Close -->|No| Monitor
    CloseJob --> PostJob
```

**Key Features:**
- Admin approval required before access
- Multiple companies per employer
- Job posting with rich details (salary, skills, location)
- Application filtering by job
- Resume download and review
- Four-stage application status management

### Admin Management Journey

```mermaid
flowchart TD
    Start[Admin Login] --> Dashboard[View Dashboard Stats]
    Dashboard --> Tasks{Management Task}
    
    Tasks -->|Employer Approval| PendingList[View Pending Employers]
    PendingList --> ReviewEmp{Review Application}
    ReviewEmp -->|Approve| ActivateEmp[Activate Account]
    ReviewEmp -->|Reject| DeleteEmp[Delete Account]
    
    Tasks -->|User Management| UserList[View All Users]
    UserList --> UserAction{Select Action}
    UserAction -->|Deactivate| DisableUser[Disable Account]
    UserAction -->|Change Role| UpdateRole[Update User Role]
    UserAction -->|Delete| RemoveUser[Delete User]
    
    Tasks -->|Content Moderation| ContentReview[Review Jobs/Companies]
    ContentReview --> ModAction{Moderation Action}
    ModAction -->|Edit| ModifyContent[Update Content]
    ModAction -->|Delete| RemoveContent[Delete Content]
    
    ActivateEmp --> Dashboard
    DeleteEmp --> Dashboard
    DisableUser --> Dashboard
    UpdateRole --> Dashboard
    RemoveUser --> Dashboard
    ModifyContent --> Dashboard
    RemoveContent --> Dashboard
```

**Key Features:**
- Platform statistics dashboard
- Employer approval queue
- User filtering and search
- Role modification capabilities
- Account activation/deactivation
- Full CRUD access to all entities

## API Module Structure

### Authentication Module (`/api/v1/auth`)

| Endpoint | Method | Purpose | Rate Limited |
|----------|--------|---------|--------------|
| `/register` | POST | Create new user account | Yes |
| `/login` | POST | Authenticate and get token | Yes |
| `/logout` | POST | Clear authentication cookie | No |
| `/me` | GET | Get current user info | No |
| `/password-reset/request` | POST | Request password reset email | Yes |
| `/password-reset/confirm` | POST | Reset password with token | Yes |

### Jobs Module (`/api/v1/jobs`)

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/` | POST | Employer/Admin | Create job posting |
| `/` | GET | Public | Search and filter jobs |
| `/{job_id}` | GET | Public | Get job details |
| `/{job_id}` | PUT | Owner/Admin | Update job posting |
| `/{job_id}` | DELETE | Owner/Admin | Delete job posting |

**Search Capabilities:**
- Text search in title and description
- Location partial matching
- Employment type filtering
- Salary range overlap matching
- Skills keyword matching (OR logic)
- Company filtering
- Pagination support

### Applications Module (`/api/v1/applications`)

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/jobs/{job_id}/apply` | POST | Seeker | Submit job application |
| `/my-applications` | GET | Seeker | List user's applications |
| `/employer/applications` | GET | Employer/Admin | List received applications |
| `/{application_id}` | GET | Owner/Employer/Admin | View application details |
| `/{application_id}/status` | PUT | Employer/Admin | Update application status |

**Business Rules:**
- One application per user per job
- Only open jobs accept applications
- Resume upload required
- File validation: type and size checks
- Files organized by user ID directories

### Companies Module (`/api/v1/companies`)

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/` | POST | Employer/Admin | Create company |
| `/` | GET | Public | List all companies |
| `/my-companies` | GET | Employer/Admin | List owned companies |
| `/{company_id}` | GET | Public | Get company details |
| `/{company_id}` | PUT | Owner/Admin | Update company |
| `/{company_id}` | DELETE | Owner/Admin | Delete company |

**Cascade Behavior:**
- Deleting company deletes all its jobs
- Deleting job deletes all its applications

### Users Module (`/api/v1/users`)

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/profile` | GET | Any User | Get own profile |
| `/profile` | PUT | Any User | Update own profile |
| `/profile/{user_id}` | GET | Public | View public profile |

### Admin Module (`/api/v1/admin`)

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/users` | GET | Admin | List all users with filters |
| `/users/{user_id}/status` | PUT | Admin | Enable/disable account |
| `/users/{user_id}/role` | PUT | Admin | Change user role |
| `/users/{user_id}` | DELETE | Admin | Delete user account |
| `/pending-employers` | GET | Admin | Get pending approvals |
| `/approve-employer/{user_id}` | POST | Admin | Approve employer |
| `/reject-employer/{user_id}` | DELETE | Admin | Reject employer |
| `/stats` | GET | Admin | Get platform statistics |

**Safety Constraints:**
- Admin cannot disable own account
- Admin cannot change own role
- Admin cannot delete own account

## Frontend Architecture

### Routing Structure

```mermaid
graph TD
    Root["/"] --> Public["Public Routes"]
    Root --> Protected["Protected Routes"]
    
    Public --> Home[Home Page - Job Listings]
    Public --> Login[Login Page]
    Public --> Register[Register Page]
    Public --> JobDetail[Job Detail Page]
    Public --> Pending[Pending Approval Page]
    
    Protected --> Seeker["Seeker Routes"]
    Protected --> Employer["Employer Routes"]
    Protected --> Admin["Admin Routes"]
    
    Seeker --> SeekerDash["/dashboard"]
    Seeker --> Applications["/my-applications"]
    Seeker --> Profile["/profile"]
    
    Employer --> EmpDash["/employer/dashboard"]
    Employer --> Companies["/employer/companies"]
    Employer --> PostJob["/employer/post-job"]
    Employer --> ManageApps["/employer/applications"]
    
    Admin --> AdminDash["/admin/dashboard"]
    Admin --> UserMgmt["/admin/users"]
```

### Component Hierarchy

| Component Type | Examples | Responsibility |
|----------------|----------|----------------|
| Layout | Layout, Navigation | App shell and navigation |
| Context | AuthContext | Global authentication state |
| Pages | HomePage, Dashboard | Full page views |
| Components | Modal, FileUpload, StatusBadge | Reusable UI elements |
| Utilities | errorTracker, API client | Cross-cutting concerns |

### State Management

**Authentication State (Context API):**
- Current user object
- Loading state
- Login/logout functions
- Role checking helpers (isAdmin, isEmployer, isSeeker)

**Local Storage:**
- JWT token for API requests
- User object for quick context restoration

**State Persistence:**
- Token validated on app load via `/auth/me` endpoint
- Invalid tokens trigger automatic logout
- User data refreshed from server

## Security Implementation

### Layer-by-Layer Protection

```mermaid
graph LR
    Request[HTTP Request] --> L1[Rate Limiting]
    L1 --> L2[Security Headers]
    L2 --> L3[CORS Validation]
    L3 --> L4[JWT Authentication]
    L4 --> L5[Role Authorization]
    L5 --> L6[Input Validation]
    L6 --> L7[Database Query]
    L7 --> Response[HTTP Response]
```

### Security Features

| Layer | Protection | Implementation |
|-------|-----------|----------------|
| Transport | HTTPS enforcement | Secure cookie flags, HSTS headers |
| Input | Validation | Pydantic schemas, file type/size checks |
| Authentication | JWT tokens | HS256 algorithm, 24hr expiration |
| Authorization | Role-based access | Dependency injection guards |
| Session | Secure cookies | HttpOnly, Secure, SameSite flags |
| Rate Limiting | Request throttling | 60 requests/minute default |
| Passwords | Hashing | Bcrypt with automatic salting |
| File Upload | Type & size validation | Whitelist MIME types, 5MB limit |
| Database | SQL injection prevention | ORM parameterized queries |
| XSS | Cookie protection | HttpOnly prevents JS access |
| CSRF | SameSite cookies | Strict SameSite policy |

### Password Reset Security

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Email
    
    User->>Frontend: Request password reset
    Frontend->>API: POST /password-reset/request
    API->>API: Check user exists
    alt User exists
        API->>API: Generate reset token (1hr expiry)
        API->>Email: Send reset email
    end
    API-->>Frontend: Generic success message
    Note over API,Frontend: No indication if email exists (anti-enumeration)
    
    User->>Email: Click reset link
    Email->>Frontend: Open reset form with token
    User->>Frontend: Enter new password
    Frontend->>API: POST /password-reset/confirm
    API->>API: Verify token signature
    API->>API: Check token expiration
    alt Token valid
        API->>API: Hash new password
        API->>API: Update user record
        API-->>Frontend: Success
    else Token invalid/expired
        API-->>Frontend: Error 400
    end
```

## File Storage System

### Upload Flow

```mermaid
flowchart TD
    Start[User Uploads Resume] --> Validate[Validate File Type]
    Validate --> ValidType{Type OK?}
    ValidType -->|No| Error1[Return 400 - Invalid Type]
    ValidType -->|Yes| ReadFile[Read File Content]
    ReadFile --> CheckSize{Size <= 5MB?}
    CheckSize -->|No| Error2[Return 400 - Too Large]
    CheckSize -->|Yes| GenName[Generate UUID Filename]
    GenName --> CreateDir[Create User Directory]
    CreateDir --> SaveFile[Save to Filesystem]
    SaveFile --> StoreURL[Save URL to Database]
    StoreURL --> Success[Return File URL]
```

### Directory Structure

```
/app/uploads/
├── {user_id_1}/
│   ├── {user_id_1}_{uuid1}.pdf
│   └── {user_id_1}_{uuid2}.docx
├── {user_id_2}/
│   └── {user_id_2}_{uuid3}.pdf
└── {user_id_3}/
    ├── {user_id_3}_{uuid4}.doc
    └── {user_id_3}_{uuid5}.pdf
```

**File Naming Convention:**
- Format: `{user_id}_{uuid4}{extension}`
- Prevents name collisions
- Maintains file type information
- Enables user-based organization

**Allowed File Types:**
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

## Middleware Stack

### Request Processing Pipeline

```mermaid
flowchart LR
    Request[Incoming Request] --> Security[Security Headers]
    Security --> CORS[CORS Middleware]
    CORS --> Rate[Rate Limiter]
    Rate --> Timer[Process Time Tracker]
    Timer --> Route[Route Handler]
    Route --> Exception[Exception Handler]
    Exception --> Response[Outgoing Response]
```

### Middleware Details

**Security Headers Middleware:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

**CORS Middleware:**
- Configurable allowed origins
- Credentials support enabled
- All methods allowed
- All headers allowed

**Rate Limiter:**
- Default: 60 requests/minute
- Authentication endpoints: stricter limits
- SlowAPI implementation
- Per-IP tracking

**Process Time Header:**
- Adds X-Process-Time to all responses
- Microsecond precision
- Enables performance monitoring

## Health Check System

### Endpoint Structure

| Endpoint | Purpose | Response Detail |
|----------|---------|----------------|
| `/health` | Basic liveness check | Simple status message |
| `/health/detailed` | Comprehensive validation | Full system diagnostics |

### Detailed Health Check Components

The detailed health endpoint validates:
- Database connectivity
- Table existence verification
- Enum value validation
- Seed data verification
- File upload directory accessibility
- API endpoint registration
- Per-component checksums
- Overall system checksum

## Data Validation

### Request Validation (Pydantic Schemas)

All API endpoints use Pydantic models for:
- Type validation
- Required field enforcement
- Format validation (email, URLs)
- Custom validators
- Automatic API documentation

**Example Validation Rules:**
- Email must be valid format
- Passwords minimum 8 characters
- Salary min cannot exceed salary max
- Resume file size limited to 5MB
- Cover letter max 5000 characters

### Database Constraints

| Constraint Type | Examples |
|----------------|----------|
| Primary Keys | Auto-incrementing integers |
| Foreign Keys | CASCADE deletion configured |
| Unique Constraints | Email addresses |
| Not Null | Required fields enforced |
| Indexes | Email, job status, employment type, location |
| Enums | Role, status fields |

## Error Handling Strategy

### Error Response Structure

All errors return consistent JSON format:

| Field | Type | Purpose |
|-------|------|---------|
| detail | string | Human-readable error message |
| error_type | string | Exception type (debug mode only) |

### HTTP Status Code Usage

| Code | Usage |
|------|-------|
| 200 OK | Successful GET requests |
| 201 Created | Successful POST creating resource |
| 204 No Content | Successful DELETE requests |
| 400 Bad Request | Validation errors, business rule violations |
| 401 Unauthorized | Missing or invalid authentication |
| 403 Forbidden | Authenticated but insufficient permissions |
| 404 Not Found | Resource does not exist |
| 500 Internal Server Error | Unexpected server errors |

### Global Exception Handler

```mermaid
flowchart TD
    Exception[Exception Occurs] --> Log[Log Full Stack Trace]
    Log --> Debug{Debug Mode?}
    Debug -->|Yes| Raise[Re-raise Exception]
    Debug -->|No| Generic[Return Generic Error]
    Generic --> Response[500 Internal Server Error]
```

**Behavior:**
- All exceptions logged with full traceback
- Debug mode shows detailed errors
- Production mode returns generic message
- Prevents information leakage

## Performance Optimizations

### Database Connection Pooling

| Parameter | Value | Purpose |
|-----------|-------|---------|
| pool_size | 20 | Concurrent connections |
| max_overflow | 40 | Additional connections under load |
| pool_recycle | 3600 | Connection refresh (1 hour) |
| pool_timeout | 30 | Wait time for connection |
| pool_pre_ping | True | Verify connection before use |

### Query Optimizations

- Indexed columns: email, job status, employment type, location
- Eager loading for relationships using joins
- Pagination on all list endpoints
- Selective field loading

### Caching Strategy

- Cache invalidation on company create/update/delete
- Strategic cache keys for common queries
- In-memory caching implementation

## Deployment Considerations

### Environment Configuration

All configuration via environment variables:
- Database connection strings
- Secret keys for JWT
- CORS origins
- File upload settings
- Email SMTP configuration
- Rate limiting parameters
- Logging levels

### Critical Production Settings

| Setting | Development | Production |
|---------|-------------|------------|
| DEBUG | True | False |
| SECRET_KEY | Any value | 64+ char random |
| SESSION_COOKIE_SECURE | False | True (requires HTTPS) |
| CORS_ORIGINS | localhost:3000 | Production domain |
| DATABASE_URL | Local PostgreSQL | Production database |

### Startup Validation

On application start:
- Security configuration validation
- Warning logs for insecure settings
- Database connection verification
- Upload directory creation

## System Integration Points

### Frontend-Backend Communication

```mermaid
sequenceDiagram
    participant Browser
    participant React
    participant API_Client
    participant FastAPI
    participant Database
    
    Browser->>React: User Action
    React->>API_Client: API Call
    API_Client->>API_Client: Add Authorization Header
    API_Client->>FastAPI: HTTP Request
    FastAPI->>FastAPI: Validate JWT
    FastAPI->>FastAPI: Check Permissions
    FastAPI->>Database: Query/Mutation
    Database-->>FastAPI: Result
    FastAPI-->>API_Client: JSON Response
    API_Client-->>React: Data
    React-->>Browser: Update UI
```

### API Client Configuration

- Base URL configured per environment
- Automatic token injection
- Request/response interceptors
- Error handling and retry logic
- Cookie support for authentication

## Key Business Rules

### User Management
- Employers require admin approval before activation
- Users cannot apply to same job multiple times
- Profile automatically created with user account
- Email addresses must be unique across platform

### Job Posting
- Only active employers can post jobs
- Employers can only post for their own companies
- Jobs default to "open" status
- Admins have full access to all jobs

### Application Process
- Only job seekers can submit applications
- Resume upload mandatory for all applications
- Applications only accepted for open jobs
- Employers can only manage applications for their jobs

### Data Deletion
- User deletion cascades to profile, companies, applications
- Company deletion cascades to jobs and applications
- Job deletion cascades to applications
- Admins protected from self-deletion

### Authorization Hierarchy
- Admins have full access to all operations
- Employers can view as seekers (dual permissions)
- Seekers have limited access to own data
- Resource owners can manage their own resources

- Employers can view as seekers (dual permissions)
- Seekers have limited access to own data
- Resource owners can manage their own resources

- Employers can view as seekers (dual permissions)
- Seekers have limited access to own data
- Resource owners can manage their own resources

