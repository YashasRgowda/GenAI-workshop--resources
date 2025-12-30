from fastapi import FastAPI
from schemas.student import StudentCreate, StudentProfile, StudentProfileWithAddress
from routers import students
app = FastAPI()

@app.post("/students")
def create_student(student: StudentCreate):
    return {
        "message": "Student created successfully!",
        "data": student
    }
    
@app.post("/profile")
def create_profile(profile: StudentProfile):
    return profile

@app.post("/student-with-address")
def create_student(student: StudentProfileWithAddress):
    return student

app.include_router(students.router)