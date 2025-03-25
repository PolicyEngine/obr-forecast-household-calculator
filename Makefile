.PHONY: setup run install-backend install-frontend setup-backend setup-frontend

# Main commands
setup: install-backend install-frontend
run: run-concurrent

# Install dependencies for both projects
install-backend:
	@echo "Installing backend dependencies..."
	cd backend && uv pip install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Setup virtual environment for backend
setup-backend:
	@echo "Setting up backend virtual environment..."
	uv venv -p 3.11
	@echo "Installing backend dependencies..."
	cd backend && uv pip install -r requirements.txt

# Run both services concurrently
run-concurrent:
	@echo "Starting both services concurrently..."
	@if command -v concurrently >/dev/null 2>&1; then \
		npx concurrently -n "BACKEND,FRONTEND" -c "blue,green" \
			"cd backend && python -m uvicorn main:app --reload --port 8000" \
			"cd frontend && npm run dev"; \
	else \
		echo "The 'concurrently' package is not installed. Installing..."; \
		npm install -g concurrently; \
		npx concurrently -n "BACKEND,FRONTEND" -c "blue,green" \
			"cd backend && python -m uvicorn main:app --reload --port 8000" \
			"cd frontend && npm run dev"; \
	fi

# Run backend only
run-backend:
	@echo "Starting backend server..."
	cd backend && python -m uvicorn main:app --reload --port 8000

# Run frontend only
run-frontend:
	@echo "Starting frontend server..."
	cd frontend && npm run dev

# Help command
help:
	@echo "OBR Forecast Household Calculator"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup             - Install all dependencies"
	@echo "  make run               - Run both frontend and backend concurrently"
	@echo "  make setup-backend     - Create venv and install backend dependencies"
	@echo "  make install-backend   - Install backend dependencies"
	@echo "  make install-frontend  - Install frontend dependencies"
	@echo "  make run-backend       - Run only the backend server"
	@echo "  make run-frontend      - Run only the frontend server"
	@echo "  make help              - Show this help message"