import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import './home.css';
import menu from "./images/menu.png";
import user1 from "./images/user.png";
import { UserContext } from "./UserContext";
import React from "react";

export default function Interface() {
    const { user } = useContext(UserContext);
    const location = useLocation();

    return (
        <header className="sec_int">
            <div className="nav-bar">
                <h1 className="title">
                    <Link to="/">Just Another Mansion</Link>
                </h1>
                <div className="nav-links">
                    <Link 
                        to="/" 
                        className={location.pathname === "/" ? "active-tab" : ""}
                    >
                        Stays
                    </Link>
                    <Link 
                        to="/experiences" 
                        className={location.pathname === "/experiences" ? "active-tab" : ""}
                    >
                        Experiences
                    </Link>
                </div>
                <div className="menu">
                    <Link to={user ? "/account" : "/login"} className="user-link" aria-label={user ? "User account" : "Login"}>
                        <img src={menu} alt="menu" className="menu-icon" />
                        <div className="user-info-container">
                            <img src={user1} alt="user" className="user-info" />
                            {!!user && (
                                <span className="user-name">{user.name}</span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
            <div className="search-wrapper">
                <div className="search-options">
                    <div className="option">Where</div>
                    <input type="text" className="search-bar" placeholder="Search destinations" />
                </div>
                <div className="vertical-line"></div>
                <div className="search-options">
                    <div className="option">Check in</div>
                    <div className="input-placeholder">Add dates</div>
                </div>
                <div className="vertical-line"></div>
                <div className="search-options">
                    <div className="option">Check out</div>
                    <div className="input-placeholder">Add dates</div>
                </div>
                <div className="vertical-line"></div>
                <div className="search-options">
                    <div className="option">Who</div>
                    <div className="input-placeholder">Add guests</div>
                </div>
                <button className="search-button">
                    <i className="fas fa-search"></i>
                </button>
            </div>
        </header>
    );
}
