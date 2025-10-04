from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from sqlalchemy import or_
import json

import models
import schemas
from database import engine, get_db

# --- Initialization ---
# Create tables if they don't exist (harmless to run multiple times)
models.Base.metadata.create_all(bind=engine)
# ----------------------

app = FastAPI(title="ExpenseFlow API (Minimal)")

# ------------------------------------------------------------------------
# 1. CRITICAL: CORS SETUP - Allows frontend to talk to this API
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    # Add any other origins your live-server might use
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------------------------------------------------------------

# Helper for HACKATHON FIX: Simple plaintext password check
def verify_password(plain_password, stored_hash):
    # This is HIGHLY INSECURE, only for the hackathon
    return plain_password == stored_hash

# Helper for minimal currency conversion (Mocked)
def minimal_convert_currency(amount: float, from_curr: str) -> float:
    # Default company currency is USD in the frontend script, so we convert everything to USD
    rates = {'USD': 1.0, 'EUR': 1.09, 'GBP': 1.25, 'JPY': 0.0068}
    rate = rates.get(from_curr, 1.0)
    
    # Assuming conversion to the base currency (USD) is desired
    return round(amount * rate, 2)


# --- Endpoint 1: Login (POST /login) ---
@app.post("/login", response_model=schemas.UserBase)
def login_user(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # The frontend expects the user object for setting role/permissions
    return user

# --- Endpoint 2: Expense Submission (POST /expenses) ---
# NOTE: We use a header/query param to pass the user ID, simulating authentication
@app.post("/expenses", response_model=schemas.Expense)
def submit_expense(
    expense_in: schemas.ExpenseCreate, 
    current_user_id: int = Query(..., alias="userId"),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Simple logic to determine approvers (Manager if exists, else Admin 1)
    approver_list = []
    if user.manager_id:
        approver_list.append(str(user.manager_id))
    
    # Fallback to Admin if no manager, or if multi-level approval is desired (e.g., hardcoded for >$500)
    # Since we skipped the Rule model, we simplify: Manager (if exists) + Admin
    if user.role != 'admin' and user.manager_id != 1:
        approver_list.append("1")
    
    approvers_str = ",".join(list(set(approver_list))) # Unique list
    first_approver_id = int(approvers_str.split(',')[0]) if approvers_str else None
    
    converted_amt = minimal_convert_currency(expense_in.amount, expense_in.currency)

    # Simple Auto-Approval Logic (since rules model is skipped)
    expense_status = "pending"
    current_approver = first_approver_id
    if converted_amt <= 100 or not approvers_str: # Auto-approve low amounts
        expense_status = "approved"
        current_approver = None

    db_expense = models.Expense(
        **expense_in.dict(), 
        employee_id=current_user_id,
        converted_amount=converted_amt,
        status=expense_status,
        approvers_list=approvers_str,
        current_approver_id=current_approver,
        approval_history=json.dumps([])
    )
    
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

# --- Endpoint 3: Fetch Expenses (GET /expenses) ---
@app.get("/expenses", response_model=List[schemas.Expense])
def get_expenses(
    current_user_id: int = Query(..., alias="userId"), 
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    query = db.query(models.Expense)

    if user.role == "admin":
        # [cite_start]Admin views all expenses [cite: 44]
        expenses = query.all()
    elif user.role == "manager":
        # [cite_start]Manager views their team's expenses [cite: 44] + expenses pending their approval
        team_members = db.query(models.User.id).filter(models.User.manager_id == current_user_id).subquery()
        expenses = query.filter(
            or_(
                models.Expense.employee_id.in_(team_members),
                models.Expense.current_approver_id == current_user_id
            )
        ).all()
    else: # Employee role
        # [cite_start]Employee views only their own expenses [cite: 44]
        expenses = query.filter(models.Expense.employee_id == current_user_id).all()
    
    return expenses

# --- Endpoint 4: Approval Action (PUT /expenses/{id}/approve) ---
@app.put("/expenses/{expense_id}/approve")
def approve_expense(
    expense_id: int, 
    approval_action: schemas.ExpenseApprove, 
    current_user_id: int = Query(..., alias="userId"), 
    db: Session = Depends(get_db)
):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    
    if not expense or expense.current_approver_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized or expense not found.")
        
    # Load history and approver list
    history = json.loads(expense.approval_history or '[]')
    approver_list = [int(x) for x in expense.approvers_list.split(',') if x]
    
    if approval_action.action == "rejected":
        expense.status = "rejected"
        expense.current_approver_id = None
        history.append({"approver_id": current_user_id, "action": "rejected", "comment": approval_action.comment})
        
    elif approval_action.action == "approved":
        current_index = approver_list.index(current_user_id)
        
        history.append({"approver_id": current_user_id, "action": "approved", "comment": approval_action.comment})
        
        if current_index < len(approver_list) - 1:
            # [cite_start]Move to next sequential approver [cite: 32]
            expense.current_approver_id = approver_list[current_index + 1]
        else:
            # Final approval
            expense.status = "approved"
            expense.current_approver_id = None

    expense.approval_history = json.dumps(history)
    db.commit()
    db.refresh(expense)
    return expense

# --- Utility Endpoint: Get All Users (for People Management) ---
@app.get("/users", response_model=List[schemas.UserBase])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
