import  { useEffect, useState } from "react";

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/students")
        .then((res) => {
            if(!res.ok){
                throw new Error("Failed to fetch students");
            }
            return res.json();
        })
        .then((data) => {
        setStudents(data);
        })
        .catch((err) => {
            setError(err.message)
        });

    }, []);

    return (
        <div>
            <h2>Students</h2>
            {error && <p style={{ color: "red"}}>{error}</p>}

            <ul>
                {students.map((s) => (
                    <li key={s.id}>
                        {s.name} = {s.email}
                    </li>
                ))}
            </ul>
            
        </div>
    );

}
