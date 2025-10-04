from sqlalchemy import Column, Integer, String, Float, Text, Date, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="employee") # 'admin', 'manager', 'employee'
    manager_id = Column(Integer, ForeignKey('users.id'), nullable=True) 
    status = Column(String(20), default="active")
    permissions = Column(JSON) # Store permissions as JSON list

    # Relationships (for easy querying)
    manager = relationship("User", remote_side=[id], backref="team")
    
class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(5), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=False)
    status = Column(String(20), default="pending")
    
    # Approval fields
    converted_amount = Column(Float) 
    approvers_list = Column(String(255))      # Comma-separated list of User IDs
    current_approver_id = Column(Integer, ForeignKey('users.id'), nullable=True) 
    approval_history = Column(JSON)          # Stored as JSON object/array
    
    submitter = relationship("User", foreign_keys=[employee_id])
    
# NOTE: We skip the complex 'Rule' model and logic for now to save time.
# The `approvers_list` can be manually managed or mocked.
