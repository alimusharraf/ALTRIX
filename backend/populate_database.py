"""
ALTRIX Database Population Script
Maps CERT r4.2 user IDs to realistic Indian corporate names
and populates the SQLite database
"""

import sys
from datetime import datetime, timedelta
import random
from models import init_db, get_session, User, SensitiveFile, ActivityLog, Incident, RiskScoreHistory

# Indian corporate names (avoiding Abhinav, Nihali, Manish, Ravisha)
INDIAN_NAMES = [
    ("Rohan Sharma", "HR"),
    ("Priya Patel", "Finance"),
    ("Arjun Kumar", "IT"),
    ("Kavya Reddy", "Marketing"),
    ("Aditya Singh", "Operations"),
    ("Sneha Gupta", "Legal"),
    ("Vikram Iyer", "Finance"),
    ("Ananya Mehta", "HR"),
    ("Karthik Nair", "IT"),
    ("Divya Rao", "Sales"),
    ("Rajesh Verma", "Operations"),
    ("Pooja Desai", "Marketing"),
    ("Amit Joshi", "IT"),
    ("Deepika Pillai", "Finance"),
    ("Sanjay Malhotra", "Legal"),
    ("Ritu Agarwal", "HR"),
    ("Varun Choudhary", "Operations"),
    ("Ishita Kapoor", "Sales"),
    ("Naveen Bhat", "IT"),
    ("Meera Krishnan", "Finance"),
    ("Harish Pandey", "Marketing"),
    ("Swati Saxena", "HR"),
    ("Kunal Thakur", "IT"),
    ("Lakshmi Venkat", "Finance"),
    ("Vishal Yadav", "Operations"),
    ("Tanvi Kulkarni", "Legal"),
    ("Rahul Bansal", "Sales"),
    ("Shruti Menon", "Marketing"),
    ("Nitin Shetty", "IT"),
    ("Aarti Bajaj", "HR"),
    ("Siddharth Chopra", "Finance"),
    ("Neha Arora", "Operations"),
    ("Gaurav Mishra", "IT"),
    ("Simran Kohli", "Marketing"),
    ("Prakash Patil", "Finance"),
    ("Anjali Dutta", "HR"),
    ("Akash Bhatt", "IT"),
    ("Rupal Shah", "Legal"),
    ("Chirag Jain", "Sales"),
    ("Nidhi Tiwari", "Finance"),
    ("Tarun Ahluwalia", "IT"),
    ("Pallavi Gupta", "Marketing"),
    ("Suresh Raman", "Operations"),
    ("Vidya Srinivas", "HR"),
    ("Mohit Khanna", "Finance"),
    ("Isha Bose", "IT"),
    ("Rohit Ghosh", "Sales"),
    ("Kavita Mukherjee", "Marketing"),
    ("Alok Sen", "Finance"),
    ("Preeti Chatterjee", "HR"),
]

# CERT malicious users
MALICIOUS_USERS = [
    "USER0036", "USER0005", "USER0059", "USER0064", "USER0104",
    "USER0124", "USER0052", "USER0143", "USER0154", "USER0026"
]

def populate_users(session):
    """Create 50 users with Indian names"""
    print("Populating users...")
    
    # Create admin account
    admin = User(
        id="secadmin",
        name="Security Administrator",
        department="Security",
        email="secadmin@altrix.com",
        role="admin",
        password="secure123",
        risk_score=0.0,
        is_malicious=False
    )
    session.add(admin)
    
    # Create 50 regular users
    for i in range(50):
        user_id = f"U{str(i+1).zfill(3)}"  # U001-U050
        cert_id = f"USER{str(i).zfill(4)}"  # USER0000-USER0049
        
        name, dept = INDIAN_NAMES[i]
        is_malicious = cert_id in MALICIOUS_USERS
        risk_score = random.uniform(65, 95) if is_malicious else random.uniform(5, 35)
        
        user = User(
            id=user_id,
            name=name,
            department=dept,
            email=f"{name.lower().replace(' ', '.')}@altrix.com",
            role="user",
            password="user123",
            risk_score=risk_score,
            is_malicious=is_malicious
        )
        session.add(user)
        
        # Add risk score history
        for j in range(7):  # Last 7 days
            days_ago = 6 - j
            score_variation = random.uniform(-5, 5)
            historical_score = max(0, min(100, risk_score + score_variation))
            
            history = RiskScoreHistory(
                user_id=user_id,
                risk_score=historical_score,
                timestamp=datetime.utcnow() - timedelta(days=days_ago),
                reason="model_prediction"
            )
            session.add(history)
    
    session.commit()
    print(f"✓ Created 51 users (1 admin + 50 employees)")


def populate_sensitive_files(session):
    """Create sensitive files database"""
    print("Populating sensitive files...")
    
    files = [
        ("FY2024_Financial_Report.xlsx", "financial", "critical", "Finance"),
        ("Employee_Salary_Data.xlsx", "hr", "critical", "HR"),
        ("Strategic_Plan_2025.pdf", "strategic", "high", "Operations"),
        ("Customer_Database_Backup.sql", "technical", "critical", "IT"),
        ("Merger_Acquisition_Docs.pdf", "strategic", "critical", "Legal"),
        ("Q4_Revenue_Projections.xlsx", "financial", "high", "Finance"),
        ("Employee_Performance_Reviews.pdf", "hr", "high", "HR"),
        ("Source_Code_Repository.zip", "technical", "high", "IT"),
        ("Marketing_Budget_2024.xlsx", "financial", "high", "Marketing"),
        ("Legal_Contracts_Archive.pdf", "strategic", "high", "Legal"),
    ]
    
    for filename, category, sensitivity, dept in files:
        file = SensitiveFile(
            filename=filename,
            category=category,
            sensitivity_level=sensitivity,
            department=dept
        )
        session.add(file)
    
    session.commit()
    print(f"✓ Created {len(files)} sensitive files")


def populate_sample_activities(session):
    """Create sample activity logs for users"""
    print("Populating activity logs...")
    
    activity_types = [
        ("login", "User logged in from corporate VPN", 0.5),
        ("file_access", "Accessed sensitive file", 5.0),
        ("email", "Sent external email with attachment", 3.0),
        ("usb", "USB device connected", 8.0),
        ("http", "Visited job search website", 4.0),
    ]
    
    count = 0
    for i in range(1, 51):
        user_id = f"U{str(i).zfill(3)}"
        user = session.query(User).filter_by(id=user_id).first()
        
        # Malicious users have more suspicious activities
        num_activities = random.randint(10, 20) if user.is_malicious else random.randint(3, 8)
        
        for _ in range(num_activities):
            activity_type, description, risk = random.choice(activity_types)
            
            # Malicious users have higher risk contributions
            if user.is_malicious:
                risk = risk * random.uniform(1.5, 2.5)
            
            activity = ActivityLog(
                user_id=user_id,
                activity_type=activity_type,
                description=description,
                risk_contribution=risk,
                timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 168))
            )
            session.add(activity)
            count += 1
    
    session.commit()
    print(f"✓ Created {count} activity logs")


def populate_incidents(session):
    """Create sample incidents for high-risk users"""
    print("Populating incidents...")
    
    incident_templates = [
        ("Unauthorized file access attempt", "User attempted to access files outside their department", "high"),
        ("Excessive USB usage detected", "Multiple USB connections in short timeframe", "medium"),
        ("Suspicious email activity", "Large number of external emails with attachments", "high"),
        ("After-hours access pattern", "Unusual login times detected", "medium"),
        ("Data exfiltration attempt", "Large file download to personal device", "critical"),
    ]
    
    count = 0
    for i in range(1, 51):
        user_id = f"U{str(i).zfill(3)}"
        user = session.query(User).filter_by(id=user_id).first()
        
        # Create incidents for malicious users
        if user.is_malicious:
            num_incidents = random.randint(2, 5)
            for _ in range(num_incidents):
                title, description, severity = random.choice(incident_templates)
                status_choice = random.choice(["open", "in_progress", "resolved"])
                
                incident = Incident(
                    user_id=user_id,
                    title=title,
                    description=description,
                    severity=severity,
                    status=status_choice,
                    is_guilty=random.choice([True, None]) if status_choice == "resolved" else None,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                    resolved_at=datetime.utcnow() - timedelta(days=random.randint(0, 5)) if status_choice == "resolved" else None
                )
                session.add(incident)
                count += 1
        
        # Occasional incidents for normal users (false positives)
        elif random.random() < 0.2:  # 20% chance
            title, description, severity = random.choice(incident_templates[:2])  # Lower severity incidents
            incident = Incident(
                user_id=user_id,
                title=title,
                description=description,
                severity="low",
                status=random.choice(["open", "resolved"]),
                is_guilty=False if random.random() < 0.8 else None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            session.add(incident)
            count += 1
    
    session.commit()
    print(f"✓ Created {count} incidents")


def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("ALTRIX Database Population Script")
    print("="*60 + "\n")
    
    # Initialize database
    print("Initializing database...")
    init_db('altrix.db')
    session = get_session('altrix.db')
    
    # Populate all tables
    populate_users(session)
    populate_sensitive_files(session)
    populate_sample_activities(session)
    populate_incidents(session)
    
    # Summary
    print("\n" + "="*60)
    print("Database Population Complete!")
    print("="*60)
    print(f"\nDatabase created: altrix.db")
    print(f"\nLogin Credentials:")
    print(f"  Admin: secadmin / secure123")
    print(f"  Users: U001-U050 / user123")
    print(f"\nMalicious Users (for simulation):")
    for cert_id in MALICIOUS_USERS:
        user_num = int(cert_id.replace("USER", "")) + 1
        user_id = f"U{str(user_num).zfill(3)}"
        user = session.query(User).filter_by(id=user_id).first()
        if user:
            print(f"  {user_id} - {user.name} (Risk Score: {user.risk_score:.1f})")
    
    session.close()
    print("\n")


if __name__ == "__main__":
    main()
