import axios from "axios";
import React, { useEffect, useState } from "react";
import './searchResults.css'; 
import { Link, useLocation } from "react-router-dom";

export default function SearchResults() {
    const location = useLocation();
    const { results } = location.state || { results: [] };
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [query, setQuery] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/search`, {
                    params: {
                        query,
                        checkIn: checkIn ? new Date(checkIn).toISOString() : null,
                        checkOut: checkOut ? new Date(checkOut).toISOString() : null,
                        guests
                    },
                });

                setResults(response.data);

                if (response.data.length > 0) {
                    const firstPlace = response.data[0];
                    const nearbyResponse = await axios.get(`http://localhost:3000/api/nearby`, {
                        params: { address: firstPlace.address }
                    });
                    setNearbyPlaces(nearbyResponse.data);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, checkIn, checkOut, guests]);

    return (
        <div className="index-page">
            {results.length > 0 ? (
                results.map(place => (
                    <Link to={'/place/' + place.id} key={place.id}>
                        <div className="place-card">
                            <div className="place-photo">
                                {place.photo && (
                                    <img src={place.photo} alt={place.title} />
                                )}
                            </div>
                            <div className="place-info">
                                <h2 className="place-title">{place.title}</h2>
                                <h3 className="place-address">{place.address}</h3>
                                <p className="place-price">₹{place.price} per night</p>
                            </div>
                        </div>
                    </Link>
                ))
            ) : (
                <p>No results found. Please adjust your search criteria.</p>
            )}

            {nearbyPlaces.length > 0 && (
                <div className="nearby-places">
                    <h2 className="nearby-title">Nearby Places</h2>
                    <div className="results-grid">
                        {nearbyPlaces.map(place => (
                            <Link to={'/place/' + place.id} key={place.id}>
                                <div className="place-card">
                                    <div className="place-photo">
                                        {place.photo && (
                                            <img src={place.photo} alt={place.title} />
                                        )}
                                    </div>
                                    <div className="place-info">
                                        <h2 className="place-title">{place.title}</h2>
                                        <h3 className="place-address">{place.address}</h3>
                                        <p className="place-price">₹{place.price} per night</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
