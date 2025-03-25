# OBR Forecast Household Calculator Frontend

A Next.js frontend for calculating how OBR forecasts affect household incomes.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Features

- Interactive household composition form
- Add/remove adults and children
- Input employment income and ages
- Calculate projected 2030 household income based on OBR forecasts
- View income comparison and percentage changes

## Backend Integration

This frontend connects to a FastAPI backend running at http://localhost:8000. Make sure the backend server is running before using this application.