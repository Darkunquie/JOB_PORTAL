"""
Health check and feature validation system.
Provides detailed checksums and validation for all system features.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from app.database import SessionLocal, engine
from app.models import User, Job, Company, Application, Profile, UserRole, ApplicationStatus, JobStatus
import hashlib
import json
from datetime import datetime


class HealthChecker:
    """Comprehensive health check for all system features."""

    def __init__(self):
        self.results: Dict[str, Any] = {}
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def calculate_checksum(self, data: Any) -> str:
        """Calculate MD5 checksum for any data."""
        json_str = json.dumps(data, sort_keys=True, default=str)
        return hashlib.md5(json_str.encode()).hexdigest()

    def check_database_connection(self) -> Dict[str, Any]:
        """Check database connectivity."""
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            return {
                "status": "healthy",
                "message": "Database connection successful",
                "checksum": self.calculate_checksum({"db": "connected"})
            }
        except Exception as e:
            self.errors.append(f"Database connection failed: {str(e)}")
            return {
                "status": "unhealthy",
                "message": str(e),
                "checksum": None
            }

    def check_tables_exist(self) -> Dict[str, Any]:
        """Verify all required tables exist."""
        try:
            inspector = inspect(engine)
            tables = inspector.get_table_names()

            required_tables = ['users', 'profiles', 'companies', 'jobs', 'applications']
            missing_tables = [t for t in required_tables if t not in tables]

            if missing_tables:
                self.errors.append(f"Missing tables: {missing_tables}")
                return {
                    "status": "unhealthy",
                    "tables": tables,
                    "missing": missing_tables,
                    "checksum": self.calculate_checksum({"tables": tables})
                }

            return {
                "status": "healthy",
                "tables": tables,
                "missing": [],
                "checksum": self.calculate_checksum({"tables": sorted(tables)})
            }
        except Exception as e:
            self.errors.append(f"Table check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "message": str(e),
                "checksum": None
            }

    def check_enums(self) -> Dict[str, Any]:
        """Validate all enum definitions."""
        try:
            enum_checks = {
                "UserRole": {
                    "values": [role.value for role in UserRole],
                    "expected": ["admin", "employer", "seeker"]
                },
                "ApplicationStatus": {
                    "values": [status.value for status in ApplicationStatus],
                    "expected": ["applied", "reviewed", "rejected", "accepted"]
                },
                "JobStatus": {
                    "values": [status.value for status in JobStatus],
                    "expected": ["open", "closed"]
                }
            }

            issues = []
            for enum_name, check in enum_checks.items():
                if set(check["values"]) != set(check["expected"]):
                    issues.append(f"{enum_name}: expected {check['expected']}, got {check['values']}")

            if issues:
                self.errors.extend(issues)
                return {
                    "status": "unhealthy",
                    "issues": issues,
                    "checksum": self.calculate_checksum(enum_checks)
                }

            return {
                "status": "healthy",
                "enums": enum_checks,
                "checksum": self.calculate_checksum(enum_checks)
            }
        except Exception as e:
            self.errors.append(f"Enum check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "message": str(e),
                "checksum": None
            }

    def check_seed_data(self) -> Dict[str, Any]:
        """Verify seed data exists."""
        try:
            db = SessionLocal()

            counts = {
                "users": db.query(User).count(),
                "companies": db.query(Company).count(),
                "jobs": db.query(Job).count(),
                "applications": db.query(Application).count(),
                "profiles": db.query(Profile).count()
            }

            role_counts = {
                "admin": db.query(User).filter(User.role == UserRole.admin).count(),
                "employer": db.query(User).filter(User.role == UserRole.employer).count(),
                "seeker": db.query(User).filter(User.role == UserRole.seeker).count()
            }

            db.close()

            warnings = []
            if counts["users"] == 0:
                warnings.append("No users found - seed data may be missing")
            if counts["jobs"] == 0:
                warnings.append("No jobs found - seed data may be missing")

            self.warnings.extend(warnings)

            return {
                "status": "healthy" if not warnings else "warning",
                "counts": counts,
                "role_counts": role_counts,
                "warnings": warnings,
                "checksum": self.calculate_checksum({"counts": counts, "role_counts": role_counts})
            }
        except Exception as e:
            self.errors.append(f"Seed data check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "message": str(e),
                "checksum": None
            }

    def check_file_upload_directory(self) -> Dict[str, Any]:
        """Verify upload directory exists and is writable."""
        import os
        try:
            upload_dir = "/app/uploads"
            exists = os.path.exists(upload_dir)
            writable = os.access(upload_dir, os.W_OK) if exists else False

            if not exists:
                self.errors.append(f"Upload directory does not exist: {upload_dir}")
            elif not writable:
                self.errors.append(f"Upload directory is not writable: {upload_dir}")

            return {
                "status": "healthy" if (exists and writable) else "unhealthy",
                "path": upload_dir,
                "exists": exists,
                "writable": writable,
                "checksum": self.calculate_checksum({"path": upload_dir, "exists": exists, "writable": writable})
            }
        except Exception as e:
            self.errors.append(f"File upload check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "message": str(e),
                "checksum": None
            }

    def check_api_endpoints(self) -> Dict[str, Any]:
        """Validate API endpoint configuration."""
        from app.main import app
        from fastapi.routing import APIRoute

        try:
            routes = []
            for route in app.routes:
                if isinstance(route, APIRoute):
                    routes.append({
                        "path": route.path,
                        "methods": list(route.methods),
                        "name": route.name
                    })

            # Check for required endpoints
            required_endpoints = [
                "/api/v1/auth/register",
                "/api/v1/auth/login",
                "/api/v1/jobs",
                "/api/v1/applications/jobs/{job_id}/apply",
                "/api/v1/companies"
            ]

            route_paths = [r["path"] for r in routes]
            missing_endpoints = [ep for ep in required_endpoints if ep not in route_paths]

            if missing_endpoints:
                self.warnings.append(f"Missing endpoints: {missing_endpoints}")

            return {
                "status": "healthy",
                "total_routes": len(routes),
                "required_endpoints": required_endpoints,
                "missing_endpoints": missing_endpoints,
                "checksum": self.calculate_checksum({"routes": len(routes), "required": required_endpoints})
            }
        except Exception as e:
            self.errors.append(f"API endpoint check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "message": str(e),
                "checksum": None
            }

    def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks and return comprehensive report."""
        start_time = datetime.utcnow()

        checks = {
            "database_connection": self.check_database_connection(),
            "tables": self.check_tables_exist(),
            "enums": self.check_enums(),
            "seed_data": self.check_seed_data(),
            "file_uploads": self.check_file_upload_directory(),
            "api_endpoints": self.check_api_endpoints()
        }

        end_time = datetime.utcnow()
        duration_ms = (end_time - start_time).total_seconds() * 1000

        # Calculate overall status
        statuses = [check.get("status", "unknown") for check in checks.values()]
        overall_status = "healthy"
        if "unhealthy" in statuses:
            overall_status = "unhealthy"
        elif "warning" in statuses:
            overall_status = "warning"

        # Generate overall checksum
        overall_checksum = self.calculate_checksum({
            "checks": {k: v.get("checksum") for k, v in checks.items()},
            "timestamp": start_time.isoformat()
        })

        return {
            "overall_status": overall_status,
            "timestamp": start_time.isoformat(),
            "duration_ms": round(duration_ms, 2),
            "checks": checks,
            "errors": self.errors,
            "warnings": self.warnings,
            "checksum": overall_checksum,
            "summary": {
                "total_checks": len(checks),
                "healthy": statuses.count("healthy"),
                "warnings": statuses.count("warning"),
                "unhealthy": statuses.count("unhealthy")
            }
        }


def get_health_report() -> Dict[str, Any]:
    """Get comprehensive health report."""
    checker = HealthChecker()
    return checker.run_all_checks()
