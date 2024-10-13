import axios from "axios";
import React, { useEffect, useState } from "react";
import './indexPage.css';
import {Link} from "react-router-dom";

export default function IndexPage() {
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/places').then(response => {
        setPlaces(response.data);
        });
    }, []);

    return (
        <div className="index-page">
        {places.length > 0 && places.map(place => (
            <Link to={'/place/'+place._id} key={place._id}>
            <div key={place._id} className="place-card">
                <div className="place-photo">
                    {place.photos?.[0] && (
                    <img src={place.photos?.[0]} alt={place.title} />
                    )}
                </div>
                <h3 className="place-address">{place.address}</h3>
                <h2 className="place-title">{place.title}</h2>
                <div className="place-price">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-small">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>{place.price} per night
                </div>
            </div>
            </Link>
        ))}
        </div>
    );
}
