import { Link, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import React from "react";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setLogin] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const { setUser } = useContext(UserContext);

    async function HandleLogin(e) {
        e.preventDefault();
        try {
            const userInfo = await axios.post('http://localhost:3000/login', { email, password }, {
                withCredentials: true
            });
            if (userInfo.data) {
                setUser(userInfo.data);
                setAlertMessage("Login successful");
                setLogin(true);
            } else {
                setAlertMessage("Login failed: " + userInfo.data);
            }
        } catch (e) {
            setAlertMessage("Login failed: " + (e.response?.data?.message || e.message));
        }
    }

    if (isLoggedIn) {
        return <Navigate to={'/'} />;
    }

    return (
        <section className="section_reg">
            <form className="form_reg" onSubmit={HandleLogin}>
                <h1>Login Page</h1>
                {alertMessage && <p>{alertMessage}</p>}

                <input className="input_reg"
                    type="email"
                    value={email}
                    placeholder="your@email.com"
                    name="email"
                    required
                    onChange={event => setEmail(event.target.value)} />

                <input className="input_reg"
                    type="password"
                    value={password}
                    placeholder="Password"
                    name="password"
                    required
                    onChange={event => setPassword(event.target.value)} />

                <button className="btn">Login</button>

                <p>Don't have an Account? <Link to="/register">Register Now</Link></p>
            </form>
        </section>
    );
}
