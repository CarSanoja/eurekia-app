.PHONY: help build up down logs shell migrate test clean

help:
	@echo "Available commands:"
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs"
	@echo "  make shell    - Open Django shell"
	@echo "  make migrate  - Run Django migrations"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Clean up containers and volumes"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

shell:
	docker-compose exec backend python manage.py shell

shell-db:
	docker-compose exec db psql -U quanta_user -d quanta_db

migrate:
	docker-compose exec backend python manage.py makemigrations
	docker-compose exec backend python manage.py migrate

makemigrations:
	docker-compose exec backend python manage.py makemigrations

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

test:
	docker-compose exec backend pytest

test-coverage:
	docker-compose exec backend pytest --cov=. --cov-report=html

clean:
	docker-compose down -v
	find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

restart:
	docker-compose restart

backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

db-logs:
	docker-compose logs -f db

celery-logs:
	docker-compose logs -f celery

init: build
	@echo "Waiting for database to be ready..."
	@sleep 5
	make migrate
	@echo "Project initialized successfully!"

dev: up
	@echo "Development environment is running!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "Run 'make logs' to see logs"