import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PricingSection from "./PricingSection";
import "./placePages.css";

export default function PageForPlace() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [showAllPhotos,setShowAllPhotos] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        if (!id) return;
        axios
        .get(`http://localhost:3000/places/${id}`)
        .then((response) => setPlace(response.data))
        .catch((error) => console.error("Error fetching place:", error));
    }, [id]);
    if (!place) return <div>Loading...</div>;

    if (showAllPhotos) {
        return (
            <div className="full-screen">
                <div className="title-container">
                <h3 className="display-title">{place.title}</h3>
                </div>
                <button className="close-button" onClick={() => setShowAllPhotos(false)}>
                    Close
                </button>
                <div className="photo-container">
                    <img src={place.photos[currentPhotoIndex]} alt={`Photo ${currentPhotoIndex + 1}`} />
                    <button
                        className="prev-button"
                        onClick={() => setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + place.photos.length) % place.photos.length)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-small">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>

                    </button>
                    <button
                        className="next-button"
                        onClick={() => setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % place.photos.length)}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-small">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    </button>
                    <div className="photo-info">
                    <p>Photo {currentPhotoIndex + 1} of {place.photos.length}
                    </p>
                    </div>
                </div>
            </div>
        );
    }
    if (showFullDescription) {
        return (
            <div className="full-screen description-page">
                <button className="close-button1" onClick={() => setShowFullDescription(false)}>
                    Close
                </button>
                <div className="full-description-container">
                    <h2>About this place</h2>
                    <p>{place.description}</p>
                    {place.extraInfo && (
                    <>
                        <h2>Rules</h2>
                        <p>{place.extraInfo}</p>
                    </>
                )}
                </div>
            </div>
        );
    }
    const hasPhotos = place.photos && place.photos.length > 0;
    const displayedPhotos = hasPhotos ? place.photos.slice(0, 4) : [];

    return (
        <div className="listing-container">
        <div className="listing-header">
            <h1 className="listing-title">{place.title}</h1>
            <div className="listing-actions">
            <button className="action-button">Share</button>
            <button className="action-button">Save</button>
            </div>
        </div>
        <div className="listing-subheader">
                {place.address && (
                    <a
                        target="_blank"
                        href={'https://maps.google.com/?q=' + place.address}
                        className="listing-location"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-small">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {place.address}
                    </a>
                )}
            </div>
        {hasPhotos && (
            <div className={`photo-grid ${place.photos.length < 3 ? "few-images" : ""}`} id="photoGrid">
            {displayedPhotos.map((photo, index) => (
                <img key={index} src={photo} alt={`Photo ${index + 1}`} />
            ))}
            <button onClick={() => setShowAllPhotos(true)} className="show-all-photos">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon-small">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
                </svg>
                Show all photos</button>
            </div>
        )}

            <div className="listing-info">
                <div className="listing-details">
                    <div className="description-container">
                        <h2>Description</h2>
                        <p className="description">
                            {place.description.slice(0, 250)}...
                        </p>
                        <button
                            className="read-more-button"
                            onClick={() => setShowFullDescription(true)}
                        >
                            Read more
                        </button>
                    </div>
                </div>
                <div className="pricing-section">
                    <PricingSection place={place} />
                </div>
            </div>
            </div>
    );
}
