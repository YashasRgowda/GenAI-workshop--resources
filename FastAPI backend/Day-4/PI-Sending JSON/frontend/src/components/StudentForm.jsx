import { useState } from "react";

export default function StudentForm() {
    const [name, setName] = useState("");
    const[email,setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async(e) => {
        e.preventDefault();

        try{
            const response = await fetch("http://localhost:8000students", 
                {
                    method: "POST",
                    headers: {"Content-Type" : "application/json"},
                    body: JSON.stringify({
                        name : name,
                        email : email
                    
                    })
                }
            );
            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.detail)
            }
            const data = await response.json();

            setMessage(data.message);
            setName("");
            setEmail("");

        } catch (error){
            setMessage(error.message);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Student</h2>
            <input
                type = "text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type = "email"
                placeholder = "Email"
                value = {email}

                onChange={(e) => setEmail(e.target.value)}
            />

            <button>ADD</button>

            {message && <p>{message}</p>}
            
        </form>
    )

}
