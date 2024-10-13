import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AccountNav from "./AccountNav";
import axios from "axios";

export default function PlacesPage() {
    const { action } = useParams();
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/user-places').then(({ data }) => {
            setPlaces(data);
        });
    }, []);

    // Optional: Add a function to re-fetch the places if an update occurs
    function refreshPlaces() {
        axios.get('http://localhost:3000/places').then(({ data }) => {
            setPlaces(data);
        });
    }

    return (
        <div className="account-page">
            <AccountNav />
            <div className="places-page">
                {action !== 'new' && (
                    <div>
                        <Link className="add-place-link" to="/account/places/new">
                            + Add new Place
                        </Link>
                    </div>
                )}
            </div>
            <div className="places-list">
                {places.length > 0 && places.map(place => (
                    <Link to={'/account/places/' + place._id} key={place._id} className="place-card">
                        <div>
                            {place.photos && place.photos.length > 0 ? (
                                <img src={place.photos[0]} alt="Place" />
                            ) : (
                                <p>No photos available</p>
                            )}
                        </div>
                        <div className="place-title">{place.title}</div>
                        <div className="place-description">{place.description}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
