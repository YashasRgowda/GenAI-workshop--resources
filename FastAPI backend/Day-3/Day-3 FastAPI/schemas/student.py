from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional

class StudentCreate(BaseModel):
    name: str = Field(min_length=3, max_length=20, description="Student name must be between 3 and 20 characters.")
    
    email: EmailStr
    
    age: int = Field(ge=18, le=60, description="Age must be between 18 and 60.")

    password: str = Field(
        min_length=8,
        description="Password must contain at least 1 uppercase letter and 1 number"
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if not any(char.isupper() for char in value):
            raise ValueError("Password must contain at least one uppercase letter")

        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one number")

        return value

class StudentProfile(BaseModel):
    bio: Optional[str] = None
    phone: Optional[str] = None 
    role: str = "student"
    
    
class Address(BaseModel):
    city: str
    state: str
    pincode: int
    
class StudentProfileWithAddress(BaseModel):
    name: str
    email: EmailStr
    address: Address
    
# Request Schemas
class StudentACreate(BaseModel):
    name: str
    email: EmailStr
    cgpa: float
    
# Response Schemas
class StudentResponse(BaseModel):
    id: int 
    name: str
    email: EmailStr
    