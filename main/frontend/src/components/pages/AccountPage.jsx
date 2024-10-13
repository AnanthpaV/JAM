import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import "./Account.css";
import PlacesPage from "./PlacesPage";
import AccountNav from "./AccountNav";

export default function AccountPage() {
    const [redirect,setRedirect] = useState(null);
    const { ready, user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    let { subpage } = useParams();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!ready) {
        return <div>Loading ...</div>;
    }
    if (ready && !user && !redirect) {
        return <Navigate to="/login" />;
    }

    if (!subpage) {
        subpage = "profile";
    }

    if (redirect){
        return <Navigate  to={redirect}/>
    }

    return (
        <>
        
        <div className="account-page">
        <AccountNav/>
            {subpage === "profile" && (
                <div className="profile-section">
                    <div className="profile-info">
                        Logged in as {user.name} ({user.email})
                    </div>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            )}

            {subpage === 'places' && (
                <PlacesPage />
            )}
        </div>
        </>
    );
}
