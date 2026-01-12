from fastapi import APIRouter, HTTPException
from schemas.students import StudentCreate, StudentResponse
from db.fake_db import students_db

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

@router.get("/", response_model=list[StudentResponse])
def get_students():
    return students_db

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int):
    for student in students_db:
        if student["id"] == student_id:
            return student
        
    raise HTTPException(
        status_code=404,
        detail="Student not found"
    )
    
@router.post("/", response_model=StudentResponse, status_code=201)
def create_student(student: StudentCreate):
    new_student = {
        "id": len(students_db) + 1,
        "name": student.name,
        "email": student.email,
        "cgpa": student.cgpa,
        "is_verified": False
    }
    
    students_db.append(new_student)
    return new_student