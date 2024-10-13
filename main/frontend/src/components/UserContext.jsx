import axios from "axios";
import React from "react";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/profile', { withCredentials: true }); // include withCredentials to send cookies
                if (response.data) {
                    setUser(response.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setUser(null);
            } finally {
                setReady(true);
            }
        };

        fetchUserData();
    }, []);

    const logout = async () => {
        await axios.post('http://localhost:3000/logout', {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, ready, logout }}>
            {children}
        </UserContext.Provider>
    );
}
