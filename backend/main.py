"""
ALTRIX FastAPI Backend
Main API endpoints for Insider Threat Detection Platform
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import os
import shap
import pickle
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from models import get_session, User, ActivityLog, Incident, SensitiveFile, AccessRequest, RiskScoreHistory

app = FastAPI(title="ALTRIX API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create shap_images directory
os.makedirs("shap_images", exist_ok=True)

# Pydantic models for requests/responses
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    role: str
    user_id: str
    name: str
    message: Optional[str] = None


class UserRiskResponse(BaseModel):
    user_id: str
    name: str
    department: str
    risk_score: float
    is_malicious: bool


class ActivityResponse(BaseModel):
    id: int
    activity_type: str
    description: str
    risk_contribution: float
    timestamp: datetime


class IncidentResponse(BaseModel):
    id: int
    user_id: str
    user_name: str
    title: str
    description: str
    severity: str
    status: str
    is_guilty: Optional[bool]
    created_at: datetime


class IncidentUpdateRequest(BaseModel):
    status: str
    is_guilty: Optional[bool] = None


class AccessRequestResponse(BaseModel):
    id: int
    user_id: str
    user_name: str
    filename: str
    reason: str
    status: str
    requested_at: datetime


class AccessRequestAction(BaseModel):
    action: str  # 'approve' or 'deny'
    admin_id: str


# Dependency to get DB session
def get_db():
    db = get_session('altrix.db')
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/api/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint with role-based routing
    Admin: secadmin / secure123
    Users: U001-U050 / user123
    """
    user = db.query(User).filter_by(id=request.username).first()
    
    if not user:
        return LoginResponse(
            success=False,
            role="",
            user_id="",
            name="",
            message="Invalid username or password"
        )
    
    if user.password != request.password:
        return LoginResponse(
            success=False,
            role="",
            user_id="",
            name="",
            message="Invalid username or password"
        )
    
    return LoginResponse(
        success=True,
        role=user.role,
        user_id=user.id,
        name=user.name,
        message="Login successful"
    )


# ============================================================================
# USER ENDPOINTS
# ============================================================================

@app.get("/api/users", response_model=List[UserRiskResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Get all users with risk scores"""
    users = db.query(User).filter(User.role == 'user').all()
    
    return [
        UserRiskResponse(
            user_id=user.id,
            name=user.name,
            department=user.department,
            risk_score=user.risk_score,
            is_malicious=user.is_malicious
        )
        for user in users
    ]


@app.get("/api/users/{user_id}", response_model=UserRiskResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get specific user details"""
    user = db.query(User).filter_by(id=user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserRiskResponse(
        user_id=user.id,
        name=user.name,
        department=user.department,
        risk_score=user.risk_score,
        is_malicious=user.is_malicious
    )


@app.get("/api/users/{user_id}/risk-history")
def get_risk_history(user_id: str, db: Session = Depends(get_db)):
    """Get risk score trend for a user (last 7 days)"""
    history = db.query(RiskScoreHistory).filter_by(user_id=user_id).order_by(RiskScoreHistory.timestamp).all()
    
    return [
        {
            "timestamp": h.timestamp.isoformat(),
            "risk_score": h.risk_score,
            "reason": h.reason
        }
        for h in history
    ]


@app.get("/api/dashboard/risk-distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    """Get risk distribution for pie chart"""
    users = db.query(User).filter(User.role == 'user').all()
    
    low = sum(1 for u in users if u.risk_score < 30)
    medium = sum(1 for u in users if 30 <= u.risk_score < 60)
    high = sum(1 for u in users if 60 <= u.risk_score < 80)
    critical = sum(1 for u in users if u.risk_score >= 80)
    
    return {
        "data": [
            {"name": "Low Risk", "value": low, "color": "#10b981"},
            {"name": "Medium Risk", "value": medium, "color": "#f59e0b"},
            {"name": "High Risk", "value": high, "color": "#ef4444"},
            {"name": "Critical Risk", "value": critical, "color": "#dc2626"}
        ],
        "total_users": len(users)
    }


# ============================================================================
# ACTIVITY ENDPOINTS
# ============================================================================

@app.get("/api/users/{user_id}/activities", response_model=List[ActivityResponse])
def get_user_activities(user_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get recent activities for a user"""
    activities = db.query(ActivityLog).filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    
    return [
        ActivityResponse(
            id=a.id,
            activity_type=a.activity_type,
            description=a.description,
            risk_contribution=a.risk_contribution,
            timestamp=a.timestamp
        )
        for a in activities
    ]


# ============================================================================
# INCIDENT ENDPOINTS
# ============================================================================

@app.get("/api/incidents", response_model=List[IncidentResponse])
def get_all_incidents(status: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all incidents, optionally filtered by status"""
    query = db.query(Incident)
    
    if status:
        query = query.filter_by(status=status)
    
    incidents = query.order_by(Incident.created_at.desc()).all()
    
    return [
        IncidentResponse(
            id=i.id,
            user_id=i.user_id,
            user_name=i.user.name,
            title=i.title,
            description=i.description,
            severity=i.severity,
            status=i.status,
            is_guilty=i.is_guilty,
            created_at=i.created_at
        )
        for i in incidents
    ]


@app.get("/api/users/{user_id}/incidents", response_model=List[IncidentResponse])
def get_user_incidents(user_id: str, db: Session = Depends(get_db)):
    """Get incidents for a specific user"""
    incidents = db.query(Incident).filter_by(user_id=user_id).order_by(Incident.created_at.desc()).all()
    
    return [
        IncidentResponse(
            id=i.id,
            user_id=i.user_id,
            user_name=i.user.name,
            title=i.title,
            description=i.description,
            severity=i.severity,
            status=i.status,
            is_guilty=i.is_guilty,
            created_at=i.created_at
        )
        for i in incidents
    ]


@app.patch("/api/incidents/{incident_id}")
def update_incident(incident_id: int, update: IncidentUpdateRequest, db: Session = Depends(get_db)):
    """Update incident status and verdict"""
    incident = db.query(Incident).filter_by(id=incident_id).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = update.status
    incident.updated_at = datetime.utcnow()
    
    if update.status == "resolved":
        incident.is_guilty = update.is_guilty
        incident.resolved_at = datetime.utcnow()
        
        # Adjust user risk score based on verdict
        user = db.query(User).filter_by(id=incident.user_id).first()
        if user:
            if update.is_guilty:
                # Keep or increase risk score
                user.risk_score = min(100, user.risk_score + 5)
            else:
                # Decrease risk score significantly
                user.risk_score = max(0, user.risk_score - 15)
            
            # Record in history
            history = RiskScoreHistory(
                user_id=user.id,
                risk_score=user.risk_score,
                reason="incident_resolution",
                timestamp=datetime.utcnow()
            )
            db.add(history)
    
    db.commit()
    
    return {"message": "Incident updated successfully"}


# ============================================================================
# SENSITIVE FILE ACCESS ENDPOINTS
# ============================================================================

@app.get("/api/sensitive-files")
def get_sensitive_files(db: Session = Depends(get_db)):
    """Get all sensitive files"""
    files = db.query(SensitiveFile).all()
    
    return [
        {
            "id": f.id,
            "filename": f.filename,
            "category": f.category,
            "sensitivity_level": f.sensitivity_level,
            "department": f.department
        }
        for f in files
    ]


@app.post("/api/access-requests")
def request_file_access(user_id: str, file_id: int, reason: str, db: Session = Depends(get_db)):
    """User requests access to a sensitive file"""
    # Check if file exists
    file = db.query(SensitiveFile).filter_by(id=file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Create access request
    request = AccessRequest(
        user_id=user_id,
        file_id=file_id,
        reason=reason,
        status="pending"
    )
    db.add(request)
    
    # Increase user's risk score slightly for requesting access
    user = db.query(User).filter_by(id=user_id).first()
    if user:
        user.risk_score = min(100, user.risk_score + 2)
        
        history = RiskScoreHistory(
            user_id=user_id,
            risk_score=user.risk_score,
            reason="file_access_request",
            timestamp=datetime.utcnow()
        )
        db.add(history)
    
    db.commit()
    
    return {"message": "Access request submitted", "request_id": request.id}


@app.get("/api/access-requests", response_model=List[AccessRequestResponse])
def get_access_requests(status: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all access requests"""
    query = db.query(AccessRequest)
    
    if status:
        query = query.filter_by(status=status)
    
    requests = query.order_by(AccessRequest.requested_at.desc()).all()
    
    return [
        AccessRequestResponse(
            id=r.id,
            user_id=r.user_id,
            user_name=r.user.name,
            filename=r.file.filename,
            reason=r.reason,
            status=r.status,
            requested_at=r.requested_at
        )
        for r in requests
    ]


@app.patch("/api/access-requests/{request_id}")
def handle_access_request(request_id: int, action: AccessRequestAction, db: Session = Depends(get_db)):
    """Approve or deny an access request"""
    access_request = db.query(AccessRequest).filter_by(id=request_id).first()
    
    if not access_request:
        raise HTTPException(status_code=404, detail="Access request not found")
    
    if action.action == "approve":
        access_request.status = "approved"
        # Decrease risk slightly for approved request
        user = db.query(User).filter_by(id=access_request.user_id).first()
        if user:
            user.risk_score = max(0, user.risk_score - 1)
    elif action.action == "deny":
        access_request.status = "denied"
        # Increase risk for denied request
        user = db.query(User).filter_by(id=access_request.user_id).first()
        if user:
            user.risk_score = min(100, user.risk_score + 5)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    access_request.reviewed_at = datetime.utcnow()
    access_request.reviewed_by = action.admin_id
    
    db.commit()
    
    return {"message": f"Access request {action.action}d successfully"}


# ============================================================================
# SHAP EXPLAINABILITY ENDPOINTS
# ============================================================================

def _generate_user_shap_values(user_id: str, is_malicious: bool):
    """Generate deterministic SHAP values for a user."""
    feature_names = [
        "USB Activity",
        "Email Sent",
        "After Hours Login",
        "File Access",
        "HTTP Requests",
        "Failed Logins",
        "Data Downloads"
    ]

    np.random.seed(hash(user_id) % 2**32)

    if is_malicious:
        shap_values = np.random.uniform(2, 8, len(feature_names))
    else:
        shap_values = np.random.uniform(-3, 2, len(feature_names))

    return [
        {"feature": feature_names[i], "value": float(round(shap_values[i], 3))}
        for i in range(len(feature_names))
    ]


@app.get("/api/users/{user_id}/shap-values")
def get_shap_values(user_id: str, db: Session = Depends(get_db)):
    """Return SHAP feature contributions for a user."""
    user = db.query(User).filter_by(id=user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return _generate_user_shap_values(user_id=user_id, is_malicious=user.is_malicious)

@app.get("/api/users/{user_id}/shap-image")
def get_shap_image(user_id: str, db: Session = Depends(get_db)):
    """Generate and return SHAP waterfall plot for user"""
    user = db.query(User).filter_by(id=user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate dummy SHAP values (in production, use actual model)
    shap_points = _generate_user_shap_values(user_id=user_id, is_malicious=user.is_malicious)
    feature_names = [point["feature"] for point in shap_points]
    shap_values = np.array([point["value"] for point in shap_points])
    
    # Create waterfall plot
    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor('#1a1a1a')
    ax.set_facecolor('#1a1a1a')
    
    # Sort by absolute value
    indices = np.argsort(np.abs(shap_values))[::-1]
    sorted_values = shap_values[indices]
    sorted_names = [feature_names[i] for i in indices]
    
    # Create waterfall
    colors = ['#ec4899' if v > 0 else '#10b981' for v in sorted_values]
    y_pos = np.arange(len(sorted_names))
    
    ax.barh(y_pos, sorted_values, color=colors, alpha=0.8)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(sorted_names, color='white', fontsize=10)
    ax.set_xlabel('SHAP Value (Impact on Risk Score)', color='white', fontsize=11)
    ax.set_title(f'Risk Score Explanation - {user.name}', color='white', fontsize=13, fontweight='bold')
    
    ax.tick_params(colors='white')
    ax.spines['bottom'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    ax.grid(axis='x', alpha=0.2, color='white')
    
    # Add base value line
    base_value = 50.0
    ax.axvline(x=0, color='white', linestyle='--', alpha=0.5, linewidth=1)
    
    plt.tight_layout()
    
    # Save image
    image_path = f"shap_images/{user_id}_shap.png"
    plt.savefig(image_path, facecolor='#1a1a1a', dpi=150)
    plt.close()
    
    return FileResponse(image_path, media_type="image/png")


# ============================================================================
# SIMULATION ENDPOINT
# ============================================================================

@app.post("/api/simulate-threat")
def simulate_threat(
    user_id: str,
    activity_type: str = "simulation",
    event_time: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Simulate a threat scenario for a user"""
    user = db.query(User).filter_by(id=user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    simulation_time = datetime.utcnow()
    if event_time:
        try:
            simulation_time = datetime.fromisoformat(event_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid event_time format. Use ISO date-time.")

    activity_label = activity_type.replace("_", " ").title()
    
    # Increase risk score
    user.risk_score = min(100, user.risk_score + 15)
    
    # Create incident
    incident = Incident(
        user_id=user_id,
        title=f"Simulated: Suspicious {activity_label} detected",
        description=f"SIMULATION: Activity type '{activity_type}' triggered elevated risk behavior pattern",
        severity="critical",
        status="open",
        created_at=simulation_time
    )
    db.add(incident)
    
    # Add activity log
    activity = ActivityLog(
        user_id=user_id,
        activity_type=activity_type,
        description=f"Threat simulation executed for activity: {activity_label}",
        risk_contribution=15.0,
        timestamp=simulation_time
    )
    db.add(activity)
    
    # Update risk history
    history = RiskScoreHistory(
        user_id=user_id,
        risk_score=user.risk_score,
        reason=f"simulation_{activity_type}",
        timestamp=simulation_time
    )
    db.add(history)
    
    db.commit()
    
    return {
        "message": "Threat simulation executed",
        "new_risk_score": user.risk_score,
        "incident_id": incident.id
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/api/health")
def health_check():
    """API health check"""
    return {"status": "healthy", "service": "ALTRIX API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
