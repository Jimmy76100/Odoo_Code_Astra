from database import Base, engine, SessionLocal
from models import User, Expense
from datetime import date
from sqlalchemy.orm import sessionmaker

# --- Hashing Logic Removed for Hackathon Speed ---

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

def seed_db():
    db = SessionLocal()
    
    # Check if users already exist
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping...")
        db.close()
        return

    print("Seeding demo users...")
    
    users_data = [
        {
            "id": 1, "name": 'John Admin', "email": 'admin@expenseflow.com', 
            "role": 'admin', "manager_id": None, "status": 'active',
            # HACKATHON FIX: Storing plaintext password for login verification
            "password_hash": 'password123',
            "permissions": ['view_all_expenses', 'approve_expense', 'manage_rules']
        },
        {
            "id": 2, "name": 'Sarah Manager', "email": 'sarah@expenseflow.com', 
            "role": 'manager', "manager_id": 1, "status": 'active',
            "password_hash": 'password123',
            "permissions": ['approve_expense', 'view_team_expenses', 'manage_team']
        },
        {
            "id": 3, "name": 'Mike Employee', "email": 'mike@expenseflow.com', 
            "role": 'employee', "manager_id": 2, "status": 'active',
            "password_hash": 'password123',
            "permissions": ['submit_expense', 'view_own_expenses']
        },
        {
            "id": 4, "name": 'Lisa Employee', "email": 'lisa@expenseflow.com', 
            "role": 'employee', "manager_id": 2, "status": 'active',
            "password_hash": 'password123',
            "permissions": ['submit_expense', 'view_own_expenses']
        }
    ]

    for data in users_data:
        user = User(**data)
        db.add(user)
    db.commit()

    print("Seeding demo expenses...")
    # Sample expenses mirroring the front-end script
    expenses_data = [
        {
            "employee_id": 3, "amount": 150.00, "currency": 'USD', 
            "category": 'Travel', "description": 'Client meeting travel', 
            "date": date(2024, 1, 15), "status": 'pending',
            "converted_amount": 150.00, 
            "approvers_list": "2", # Manager Sarah is approver
            "current_approver_id": 2,
            "approval_history": []
        },
        {
            "employee_id": 4, "amount": 250.00, "currency": 'EUR', 
            "category": 'Travel', "description": 'Business trip to Paris', 
            "date": date(2024, 1, 16), "status": 'pending',
            "converted_amount": 272.50, # Mocked EUR->USD conversion
            "approvers_list": "2,1", # Manager Sarah, Admin John
            "current_approver_id": 2,
            "approval_history": []
        }
    ]
    
    for data in expenses_data:
        expense = Expense(**data)
        db.add(expense)
    db.commit()

    db.close()
    print("Database seeding complete.")

if __name__ == "__main__":
    init_db()
    seed_db()
