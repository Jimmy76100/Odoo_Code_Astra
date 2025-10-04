from pydantic import BaseModel
from datetime import date
from typing import List, Optional, Any

# --- User Schemas ---
class UserBase(BaseModel):
    id: int
    name: str
    email: str
    role: str
    manager_id: Optional[int] = None
    status: str
    permissions: Optional[Any] = None # For JSON field

    class Config:
        orm_mode = True
        
class UserLogin(BaseModel):
    email: str
    password: str

# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    amount: float
    currency: str
    category: str
    description: str
    date: date
    
class ExpenseCreate(ExpenseBase):
    # This is the incoming data from the frontend
    pass

class Expense(ExpenseBase):
    # This is the data returned to the frontend
    id: int
    employee_id: int
    status: str
    converted_amount: float
    approvers_list: Optional[str]
    current_approver_id: Optional[int]
    approval_history: Optional[Any]

    class Config:
        orm_mode = True

# --- Approval Schema ---
class ExpenseApprove(BaseModel):
    action: str # 'approved' or 'rejected'
    comment: Optional[str] = None
