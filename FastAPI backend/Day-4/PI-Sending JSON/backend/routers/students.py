from fastapi import APIRouter, HTTPException, status
from schemas.student import StudentCreate

router = APIRouter(
    prefix = "/students",
    tags = ["Students"]
)

students_db = []

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_student(student: StudentCreate):
    for s in students_db:
        if s["email"] == student.email:
            raise HTTPException(
                status_code = 400,
                detail = "Email already exists"
            )
            
        new_student = {
            "name": student.name,
            "email ": student.email
        }
        
        students_db.append(new_student)
        
        return {
            "message": "Student added successfully ",
            "student": new_student
        }