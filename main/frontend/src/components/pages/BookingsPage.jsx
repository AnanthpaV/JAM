import React, { useEffect, useState } from "react";
import { format, formatDistance } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from "./AccountNav";
import axios from "axios";
import PlaceImg from "./PlaceImg";
import { FaCalendarAlt, FaUser, FaUsers } from "react-icons/fa";
import "./Bookings.css";
import "./Account.css";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  // Fetch bookings and ensure status is correctly set
  useEffect(() => {
    axios.get('http://localhost:3000/bookings')
      .then(response => {
        setBookings(response.data);
      })
      .catch(error => {
        console.error('Error fetching bookings:', error); // Debugging: Log any errors
      });
  }, []);

  // Function to determine the booking status based on check-in/out dates and status field
  const getBookingStatus = (booking) => {
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);

    if (booking.status === 'Cancelled') {
      return 'Cancelled';
    } else if (now < checkInDate) {
      return 'Upcoming';
    } else if (now >= checkOutDate) {
      return 'Completed';
    } else {
      return 'Ongoing';
    }
  };

  // Handle case where no bookings are found
  if (bookings.length === 0) {
    return (
      <div className="no-bookings">
        <h2>No bookings found</h2>
        <p>It looks like you haven't booked any places yet!</p>
      </div>
    );
  }

  return (
    <div className="account-page">
      <AccountNav />
      <div className="places-list">
        {bookings.map((booking) => (
          <Link to={`/account/bookings/${booking._id}`} key={booking._id} className="place-card">
            <PlaceImg place={booking.place} />
            {/* Display booking status */}
            <div className={`booking-status ${getBookingStatus(booking).toLowerCase()}`}>
              {getBookingStatus(booking)}
            </div>
            <div className="place-details">
              <div className="place-name">
                {booking.place?.title || "Unknown Place"}
              </div>
              <div className="place-address">
                {booking.place?.address || "Address not available"}
              </div>
              <div className="date-range">
                <FaCalendarAlt style={{ marginRight: "8px" }} />
                <span>
                  {format(new Date(booking.checkIn), "dd MMM yyyy")} -{" "}
                  {format(new Date(booking.checkOut), "dd MMM yyyy")}
                </span>
                <span>
                  ({formatDistance(new Date(booking.checkIn), new Date(booking.checkOut))} stay)
                </span>
              </div>
              <div className="price">
                <div className="price-amount">₹{booking.price}</div>
                <div className="price-info">Total Price</div>
              </div>
              <div className="guests">
                <FaUsers className="guests-icon" />
                <span>
                  {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                </span>
              </div>
              <div className="name">
                <FaUser className="name-icon" />
                <span>Booked by: {booking.name || "Unknown"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
