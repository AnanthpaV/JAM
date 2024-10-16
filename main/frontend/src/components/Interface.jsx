import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './home.css';
import menu from "./images/menu.png";
import user1 from "./images/user.png";
import { UserContext } from "./UserContext";
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function Interface() {
    const { user } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:3000/api/search`, {
                params: {
                    query: searchQuery,
                    checkIn: checkIn ? checkIn.toISOString() : null,
                    checkOut: checkOut ? checkOut.toISOString() : null,
                    guests: guests
                }
            });
            navigate('/search-results', {
                state: {
                    query: searchQuery,
                    results: response.data,
                    checkIn,
                    checkOut,
                    guests
                }
            });
        } catch (error) {
            console.error('Error during search:', error);
            setError('An error occurred while searching. Please try again.');
        } finally {
            setLoading(false);
        }
    };
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
            <form onSubmit={handleSearch} className="search-wrapper">
                <div className="search-options">
                    <div className="option">Where</div>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search destinations"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="vertical-line"></div>
                <div className="search-options">
                    <div className="option">Check in</div>
                    <DatePicker
                        selected={checkIn}
                        onChange={(date) => setCheckIn(date)}
                        selectsStart
                        startDate={checkIn}
                        endDate={checkOut}
                        placeholderText="Add dates"
                        className="date-picker"
                    />
                </div>
                <div className="vertical-line"></div>
                <div className="search-options">
                    <div className="option">Check out</div>
                    <DatePicker
                        selected={checkOut}
                        onChange={(date) => setCheckOut(date)}
                        selectsEnd
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={checkIn}
                        placeholderText="Add dates"
                        className="date-picker"
                    />
                </div>
                <div className="vertical-line"></div>
                <div className="search-options">
                    <div className="option">Guests</div>
                    <input
                        type="number"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="guests-input"
                    />
                </div>
                <button type="submit" className="search-button" disabled={loading}>
                    {loading ? 'Searching...' : <i className="fas fa-search"></i>}
                </button>
            </form>
            {error && <div className="error-message">{error}</div>}
        </header>
    );
}
