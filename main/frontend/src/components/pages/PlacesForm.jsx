import { useEffect, useState } from "react";
import Perks from "./Perks";
import React from "react";
import PhotoUploader from "./PhotoUploader";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import AccountNav from "./AccountNav";

export default function PlacesForm() {
    const { id } = useParams(); // Get the place ID from the URL
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);
    const [addedPhotos, setAddedPhotos] = useState([]);
    const [redirect, setRedirect] = useState(false);
    const [price, setPrice] = useState(1000);

    // Fetch place details if the ID is provided
    useEffect(() => {
        if (!id) return;

        axios.get(`http://localhost:3000/places/${id}`)
            .then(response => {
                const data = response.data;
                if (data) {
                    setTitle(data.title || '');
                    setAddress(data.address || '');
                    setAddedPhotos(data.photos || []);
                    setDescription(data.description || '');
                    setPerks(data.perks || []);
                    setExtraInfo(data.extraInfo || '');
                    setCheckIn(data.checkIn || '');
                    setCheckOut(data.checkOut || '');
                    setMaxGuests(data.maxGuests || 1);
                    setPrice(data.price || 1000);
                }
            })
            .catch(error => {
                console.error('Error fetching the place details:', error);
            });
    }, [id]);

    // Ensure valid check-in and check-out times before submitting
    function validateForm() {
        if (!title || !address || !description || !checkIn || !checkOut || !maxGuests || !price) {
            alert('Please fill in all required fields.');
            return false;
        }

        // Ensure check-in and check-out times are valid
        const checkInTime = new Date(`1970-01-01T${checkIn}:00Z`);
        const checkOutTime = new Date(`1970-01-01T${checkOut}:00Z`);

        if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) {
            alert('Invalid check-in or check-out time.');
            return false;
        }

        if (checkInTime >= checkOutTime) {
            alert('Check-out time must be after check-in time.');
            return false;
        }

        return true;
    }

    // Handle form submission
    // Handle form submission
async function addNewPlace(ev) {
    ev.preventDefault();
    if (!validateForm()) return;

    // Convert check-in and check-out times to full date-time strings
    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in "YYYY-MM-DD" format
    const checkInDateTime = `${currentDate}T${checkIn}:00`;
    const checkOutDateTime = `${currentDate}T${checkOut}:00`;

    const placeData = {
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn: checkInDateTime,  // Send the full date-time string to the backend
        checkOut: checkOutDateTime, // Send the full date-time string to the backend
        maxGuests,
        price
    };

    try {
        if (id) {
            // Update existing place
            await axios.put(`http://localhost:3000/places/${id}`, placeData);
        } else {
            // Create a new place
            await axios.post('http://localhost:3000/places', placeData);
        }
        setRedirect(true); // Redirect to another page after saving
    } catch (error) {
        console.error('Error saving the place:', error.response?.data || error.message);
    }
}


    // Redirect to account places page after saving
    if (redirect) {
        return <Navigate to={'/account/places'} />;
    }

    // Helper function to create section labels for input fields
    function preInput(label, description) {
        return (
            <div className="input-section">
                <h2>{label}</h2>
                <p>{description}</p>
            </div>
        );
    }

    return (
        <div className="account-page">
            <AccountNav />
            <div className="places-page">
                <form className="form-container" onSubmit={addNewPlace}>
                    {preInput('Title', 'Title for your place. Should be short and catchy like an advertisement.')}
                    <input
                        type="text"
                        value={title}
                        onChange={ev => setTitle(ev.target.value)}
                        className="input-text"
                        placeholder="Title, for example: My lovely apartment" />

                    {preInput('Address', 'Address of this place')}
                    <input
                        type="text"
                        value={address}
                        onChange={ev => setAddress(ev.target.value)}
                        className="input-text"
                        placeholder="Enter the address" />

                    {preInput('Photos', 'More photos = better')}
                    <PhotoUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

                    {preInput('Description', 'Describe your place in detail.')}
                    <textarea
                        value={description}
                        onChange={ev => setDescription(ev.target.value)}
                        className="input-textarea"
                        placeholder="Description of the place" />
                    {preInput('Perks','select all the perks of your place')}
                    <Perks selected={perks} onChange={setPerks} />

                    {preInput('Extra Info', 'House rules, things guests should know.')}
                    <textarea
                        value={extraInfo}
                        onChange={ev => setExtraInfo(ev.target.value)}
                        className="input-textarea"
                        placeholder="House rules, etc." />

                    {preInput('Check-in & Check-out times', 'Add check-in and check-out times.')}
                    <div className="time-input-container">
                        <div className="time-input-wrapper">
                            <h3>Check-in Time</h3>
                            <input
                                type="time"
                                value={checkIn}
                                onChange={ev => setCheckIn(ev.target.value)}
                                className="input-text"
                            />
                        </div>
                        <div className="time-input-wrapper">
                            <h3>Check-out Time</h3>
                            <input
                                type="time"
                                value={checkOut}
                                onChange={ev => setCheckOut(ev.target.value)}
                                className="input-text"
                            />
                        </div>
                    </div>

                    {preInput('Max guests', 'How many guests are allowed?')}
                    <input
                        type="number"
                        value={maxGuests}
                        onChange={ev => setMaxGuests(ev.target.value)}
                        className="input-text"
                        placeholder="Max number of guests" />

                    {preInput('Price per night', 'Set the price for one night stay')}
                    <input
                        type="number"
                        value={price}
                        onChange={ev => setPrice(ev.target.value)}
                        className="input-text"
                        placeholder="Price per night" />

                    <button className="save-button" type="submit">Save</button>
                </form>
            </div>
        </div>
    );
}
