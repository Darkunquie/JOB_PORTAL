.PHONY: help build up down restart logs migrate seed clean

help:
	@echo "Job Marketplace - Available Commands"
	@echo "===================================="
	@echo "make build      - Build all Docker images"
	@echo "make up         - Start all services"
	@echo "make down       - Stop all services"
	@echo "make restart    - Restart all services"
	@echo "make logs       - View logs from all services"
	@echo "make migrate    - Run database migrations"
	@echo "make seed       - Seed database with initial admin user"
	@echo "make clean      - Remove all containers and volumes"

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services started. Access the application at http://localhost"
	@echo "API documentation at http://localhost:8000/api/docs"

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

migrate:
	docker-compose exec backend alembic upgrade head
	@echo "Database migrations completed"

seed:
	docker-compose exec backend python -c "\
	from app.database import SessionLocal; \
	from app.models import User, Profile; \
	from app.auth.security import get_password_hash; \
	db = SessionLocal(); \
	existing = db.query(User).filter(User.email == 'admin@jobmarket.com').first(); \
	if not existing: \
		admin = User(email='admin@jobmarket.com', password_hash=get_password_hash('Admin123!'), role='admin', is_active=True); \
		db.add(admin); \
		db.flush(); \
		profile = Profile(user_id=admin.id, full_name='System Administrator'); \
		db.add(profile); \
		db.commit(); \
		print('Admin user created: admin@jobmarket.com / Admin123!'); \
	else: \
		print('Admin user already exists'); \
	db.close();"

clean:
	docker-compose down -v
	@echo "All containers and volumes removed"
