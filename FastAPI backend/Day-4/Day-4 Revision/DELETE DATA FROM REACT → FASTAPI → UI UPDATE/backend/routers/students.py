from fastapi import APIRouter, HTTPException

router = APIRouter(prefix = "/students", tags = ["students"])

students_db = [
 {"id": 1, "name": "Alex", "email": "alex@mail.com"},
 {"id": 2, "name": "Sam", "email": "sam@mail.com"},
 {"id": 3, "name": "Riya", "email": "riya@mail.com"},
]

@router.get("/")
def get_students():
    return students_db

@router.delete("/{student_id}")
def delete_student(student_id: int):
    for student in students_db:
        if student["id"] == student_id:
            students_db.remove(student)
            return {"message": "Student deleted successfully"}
    raise HTTPException(status_code=404, detail="Student not found")