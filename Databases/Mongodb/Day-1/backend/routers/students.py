from fastapi import APIRouter, HTTPException
from models.student import Student
from database import student_collection

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("/")
async def create_student(student: Student):
    student_dict = student.dict()
    result = await student_collection.insert_one(student_dict)
    return {
        "message": "Student created",
        "id": str(result.inserted_id)
    }



@router.get("/")
async def get_students():
    students = []
    cursor = student_collection.find()
    async for student in cursor:
        student["_id"] = str(student["_id"])
        students.append(student)
        
    return students