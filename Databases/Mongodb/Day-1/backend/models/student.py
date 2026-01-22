from pydantic import BaseModel, EmailStr
from typing import Optional

class Student(BaseModel):
    name: str
    email: EmailStr
    age: int