from fastapi import APIRouter
from db import students
from schemas.student import Student

router = APIRouter(
    prefix = "/students",
    tags = ["Students"]
)

@router.get("/", response_model=list[Student])
def get_students():
    return students

