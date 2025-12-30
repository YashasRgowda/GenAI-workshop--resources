from fastapi import APIRouter
from schemas.student import StudentResponse
from db.fake_db import students_db

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

@router.get("/", response_model=list[StudentResponse])
def get_students():
    return students_db
