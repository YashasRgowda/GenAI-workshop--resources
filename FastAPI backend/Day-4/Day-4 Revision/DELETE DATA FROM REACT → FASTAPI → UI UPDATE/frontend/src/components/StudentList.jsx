import {useEffect, useState} from "react";

export default function StudentList() {
    const [students, setStudents] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch("http://localhost:8000/students")
        .then((res) => res.json())
        .then((data) => setStudents(data))
        .catch(() => setError("Failed to load students"));
    }, []);

    const deleteStudent = (id) => {
        fetch(`http://localhost:8000/students/${id}`, {
            method: "DELETE",
        })
        .then((res) => {
            if(!res.ok){
                throw new Error("Delete failed");
            }
            return res.json();
        })
        .then(() => {
            setStudents((prev) =>
                prev.filter((student) => student.id !== id)
            );
        })
        .catch(() => {
            return setError("Unable to delte student")
        })
    };


    return (
        <div style={{padding: "20px"}}>
            <h2>Student List</h2>

            {error && <p style={{color: "red"}}>{error}</p>}

            <ul>
                {students.map((student) => (
                    <li key={student.id}>
                        {student.name} -- {student.email}
                        <button onClick={() => deleteStudent(student.id)} style={{marginLet: "10px"}}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

}