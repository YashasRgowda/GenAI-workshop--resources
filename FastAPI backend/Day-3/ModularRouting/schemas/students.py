from pydantic import BaseModel, EmailStr
from typing import Optional

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    cgpa: float
    
class StudentResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    
class StudentInternal(BaseModel):
    id: int
    name: str
    email: EmailStr
    cgpa: float
    is_verified: bool 
    