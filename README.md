# ALTRIX - Insider Threat Detection System

ALTRIX is a full-stack security analytics platform for insider threat detection.
It combines behavior-based risk scoring, explainable AI (SHAP), incident management, and sensitive file access workflows.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Axios
- Backend: FastAPI, SQLAlchemy, SQLite
- ML/Analytics: NumPy, scikit-learn, XGBoost, SHAP, Matplotlib

## Project Structure

- backend: FastAPI app, database models, seed script
- frontend: React + Tailwind UI
- data: CERT r4.2 source datasets
- notebooks: model training notebook
- shap_images: generated SHAP images

## Core Features

- Role-based authentication (Admin and User)
- User risk scoring and risk history tracking
- Admin dashboards with risk and incident insights
- User dashboard with timeline activity
- Alerts feed with SHAP explainability and text explanation
- Sensitive file explorer and access request workflow
- Incident lifecycle management (open, in_progress, resolved)
- Threat simulation endpoint for controlled testing

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

## Setup and Run

### 1. Backend setup

From the project root:

```powershell
cd backend
python -m venv myenv
.\myenv\Scripts\Activate.ps1
pip install -r ..\requirements.txt
```

If PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 2. Initialize and populate database

From backend folder:

```powershell
python populate_database.py
```

This creates altrix.db with seeded users, incidents, activities, and sensitive files.

### 3. Start backend API

From backend folder:

```powershell
python main.py
```

Backend runs at: http://localhost:8000

### 4. Frontend setup and run

From project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

## Default Login Credentials

- Admin: secadmin / secure123
- Users: U001 to U050 / user123

## Key Frontend Routes

- / : Landing page
- /login : Login page
- /dashboard : User dashboard (timeline)
- /user-alerts : User alerts feed with SHAP insights
- /user-file-explorer : User file explorer and access requests
- /admin : Admin dashboard
- /user-intelligence : Admin user deep-dive
- /incident-management : Admin incident operations
- /sensitive-access : Admin file access approvals
- /threat-simulation : Admin threat simulation panel

## Key API Endpoints

### Authentication

- POST /api/login

### Users and Risk

- GET /api/users
- GET /api/users/{user_id}
- GET /api/users/{user_id}/risk-history
- GET /api/users/{user_id}/activities

### Incidents

- GET /api/incidents
- GET /api/users/{user_id}/incidents
- PATCH /api/incidents/{incident_id}

### Sensitive Access

- GET /api/sensitive-files
- POST /api/access-requests
- GET /api/access-requests
- PATCH /api/access-requests/{request_id}

### Explainability

- GET /api/users/{user_id}/shap-values
- GET /api/users/{user_id}/shap-image

### Simulation and Health

- POST /api/simulate-threat
- GET /api/health

## Notes

- The current SHAP values are deterministic synthetic values for each user ID.
- Risk score updates occur via incident resolution, file access requests, and simulation actions.
- User session persistence is handled in frontend localStorage.

## Troubleshooting

### Frontend redirects to login unexpectedly

- Ensure backend is running and login succeeds.
- Clear browser storage for the app and login again.

### CORS issues

- Backend currently allows localhost:5173 and localhost:3000.
- Update CORS allow_origins in backend/main.py if needed.

### Empty dashboards

- Make sure database has been seeded by running populate_database.py.

### Port conflicts

- Change backend port in backend/main.py or free port 8000.
- Change frontend port via Vite config if needed.

## Suggested Next Improvements

- Add JWT authentication and secure password hashing
- Add environment-based configuration for API URLs and secrets
- Add unit/integration tests for backend endpoints and frontend pages
- Add Docker support for one-command startup
