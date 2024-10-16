import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from 'date-fns';
import { FaCalendarAlt, FaUser, FaUsers, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import "./Bookings.css";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/bookings/${id}`);
        setBooking(response.data);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Failed to load booking details");
      }
    };

    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.post(`http://localhost:3000/bookings/${id}/cancel`);
        setBooking(prevBooking => ({ ...prevBooking, status: 'Cancelled' }));
        alert("Booking cancelled successfully");
        navigate("/account/bookings/"); // Navigate to PlacesPage after cancellation
      } catch (err) {
        console.error("Error cancelling booking:", err);
        alert("Failed to cancel booking");
      }
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!booking) return <div className="loading">Loading...</div>;

  return (
    <div className="booking-page">
      <h1>Booking Details</h1>
      <div className="booking-card">
        <div className="booking-header">
          <h2>{booking.place.title}</h2>
          <span className={`booking-status ${booking.status ? booking.status.toLowerCase() : ''}`}>
            {booking.status || 'Unknown'}
          </span>
        </div>

        <div className="booking-info">
          <div className="info-item">
            <FaCalendarAlt />
            <span>
              {format(new Date(booking.checkIn), "MMM dd, yyyy")} - 
              {format(new Date(booking.checkOut), "MMM dd, yyyy")}
            </span>
          </div>
          <div className="info-item">
            <FaUsers />
            <span>{booking.guests} guests</span>
          </div>
          <div className="info-item">
            <FaMapMarkerAlt />
            <span>{booking.place.address}</span>
          </div>
          <div className="info-item">
            <FaUser />
            <span>Booked by: {booking.name}</span>
          </div>
          <div className="info-item">
            <FaPhone />
            <span>Phone: {booking.phone}</span>
          </div>
        </div>

        <div className="booking-price">
          <h3>Total Price</h3>
          <span>₹{booking.price}</span>
        </div>

        {booking.status !== "Cancelled" && (
          <button className="cancel-button" onClick={handleCancelBooking}>
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}