# OBR Forecast Household Calculator

A web application that allows households to calculate how the latest OBR forecasts might affect their net income by 2030.

## Project Structure

This project consists of two main components:

- `frontend/`: A Next.js application with TypeScript and Tailwind CSS
- `backend/`: A FastAPI Python backend

## Getting Started

### Using Makefile (Recommended)

The project includes a Makefile for easy setup and running:

1. Set up both backend and frontend:
```bash
make setup
```

2. Run both services concurrently:
```bash
make run
```

Additional Makefile commands:
- `make setup-backend` - Create virtual environment and install backend dependencies
- `make install-backend` - Install backend dependencies only
- `make install-frontend` - Install frontend dependencies only
- `make run-backend` - Run only the backend server
- `make run-frontend` - Run only the frontend server
- `make help` - Show all available commands

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Features

- Input household composition (adults and children)
- Input employment income and ages
- Calculate projected 2030 household income based on OBR forecasts
- View income comparison and percentage changes

## Disclaimer

This is a simplified calculator for demonstration purposes. The calculations are based on approximate forecasts and may not reflect actual future outcomes.

## License

This project is licensed under the MIT License.