import { useEffect, useState } from "react";

export default function StudentList(){
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    
    useEffect(() =>{
        fetch("http://localhost:8000/students")
        .then((response) => {
            if (!response.ok){
                throw new Error("Failed to fetch students");
            }
            return response.json();
        })
        .then((data) => {
            setStudents(data);
        })
        .catch((err) => {
            setError(err.message);
        });
    }, []);

    return (
        <div style={{padding: "20px"}}>
            <h2>Student List</h2>

            {error && <p style={{ color:"red"}}>{error}</p>}

            {students.length === 0 && <p>No students found</p>}

            <ul>
                {students.map((student) => (
                    <li key={student.id}>
                        {student.name} - {student.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}