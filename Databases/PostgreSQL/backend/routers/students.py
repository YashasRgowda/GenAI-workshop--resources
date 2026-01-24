from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy.orm import Session 
from database import get_db 
from models.student import Student 
from schemas.student import StudentCreate, StudentResponse 
 
router = APIRouter(prefix="/students", tags=["Students"])

@router.post("/", response_model=StudentResponse) 
def create_student(student: StudentCreate, db: Session = Depends(get_db)): 
   new_student = Student(**student.dict()) 
   db.add(new_student)
   db.commit()
   db.refresh(new_student)
   return new_student

@router.get("/", response_model=list[StudentResponse]) 
def get_students(db: Session = Depends(get_db)): 
   return db.query(Student).all()

@router.get("/{student_id}") 
def get_student(student_id: int, db: Session = Depends(get_db)): 
   student = db.query(Student).filter(Student.id == student_id).first() 
   if not student: 
       raise HTTPException(404, "Student not found") 
   return student

@router.put("/{student_id}") 
def update_student(student_id: int, data: StudentCreate, db: Session = Depends(get_db)): 
   student = db.query(Student).filter(Student.id == student_id).first() 
   if not student: 
       raise HTTPException(404, "Student not found") 
 
   for key, value in data.dict().items(): 
       setattr(student, key, value) 
 
   db.commit() 
   return student


@router.delete("/{student_id}") 
def delete_student(student_id: int, db: Session = Depends(get_db)): 
   student = db.query(Student).filter(Student.id == student_id).first() 
   if not student: 
       raise HTTPException(404, "Student not found") 
 
   db.delete(student) 
   db.commit() 
   return {"message": "Deleted"}