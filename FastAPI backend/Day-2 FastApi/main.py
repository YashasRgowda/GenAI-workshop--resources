from fastapi import FastAPI 
from schemas.student import Student
import json
from schemas.student import StudentUpdate
 
app = FastAPI() 

with open("students.json") as f:
    students = json.load(f)
 
@app.get("/") 
def home(): 
    return {"message": "Hello students, FastAPI is working!"}

@app.post("/add-student")
def add_student(student: Student):
    return{
        "message": "Student added successfully!",
        "data": student
    }

@app.get("/students/{student_id}")
def get_student(student_id: int):
    for student in students:
        if student["id"]==student_id:
            return student
    return {"error": "Student not found"}

@app.get("/filter-students")
def filter_students(age: int = None, name: str = None):
    results = students
    
    # Filter by age 
    if age is not None:
        results = [s for s in results if s["age"] == age]
        
    # Filter by name
    if name is not None:
        results = [s for s in results if s["name"].lower() == name.lower()]
               
    return results

@app.put("/students/{student_id}")
def update_student(student_id: int, updated_data: Student):
    for student in students:
        if student["id"] == student_id:
            student["name"] = updated_data.name
            student["age"] = updated_data.age
            student["email"] = updated_data.email
            return {
                "message": "Student updated successfully!",
                "data": student
            }
    return {"error": "Student not found"}


@app.patch("/students/{student_id}") 
def patch_student(student_id: int, new_data: StudentUpdate): 
 
    for student in students: 
        if student["id"] == student_id: 
 
            # Update only provided fields 
            if new_data.name is not None: 
                student["name"] = new_data.name 
 
            if new_data.age is not None: 
                student["age"] = new_data.age 
 
            if new_data.email is not None: 
                student["email"] = new_data.email 
 
            # Save changes back to JSON 
            with open("students.json", "w") as file: 
                json.dump(students, file, indent=9) 
 
            return { 
                "message": "Student partially updated", 
                "student": student 
            } 
 
    return {"error": "Student not found"} 
