import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import React from "react";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/register", {
                name: name,
                email: email,
                password: password,
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log(response.data);
            setAlertMessage("Registration successful. Now you can login");
        } catch (error) {
            console.error("Error: ", error);
            setAlertMessage("Registration failed. Please try again later");
        }
    };

    return (
        <section className="section_reg">
            <form className="form_reg" onSubmit={handleSubmit}>
                <h1>Register</h1>
                {alertMessage && <p>{alertMessage}</p>}
                <input
                    className="input_reg"
                    type="text"
                    required
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter Name"
                    name="name"
                    value={name}
                />

                <input
                    className="input_reg"
                    type="email"
                    required
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="your@email.com"
                    name="email"
                    value={email}
                />

                <input
                    className="input_reg"
                    type="password"
                    required
                    maxLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    name="password"
                    value={password}
                />

                <button type="submit" className="btn">Register</button>

                <p>Already Registered? <Link to="/login">Login</Link></p>
            </form>
        </section>
    );
}
