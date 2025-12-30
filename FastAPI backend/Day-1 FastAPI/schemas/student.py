from typing import Optional
from pydantic import BaseModel

class Student(BaseModel):
    name: str
    age: int
    email: str

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    email: Optional[str] = None
