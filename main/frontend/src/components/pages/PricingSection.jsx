import React, { useState, useEffect } from "react";
import { differenceInDays, parse } from "date-fns";
import "./placePages.css"

export default function PricingSection({ place }) {
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nights, setNights] = useState(0);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = parse(checkIn, "yyyy-MM-dd", new Date());
      const end = parse(checkOut, "yyyy-MM-dd", new Date());
      const nightCount = differenceInDays(end, start);
      setNights(nightCount > 0 ? nightCount : 0);
    }
  }, [checkIn, checkOut]);

  const totalPrice = place.price * nights + 300 + 500; // Base + Cleaning fee + Service fee

  return (
    <div className="listing-price-container">
      <div className="price-header">
        <span className="price">₹{place.price}</span>
        <span className="price-period">/ night</span>
      </div>

      <div className="date-picker">
        <div className="date-input">
          <label htmlFor="check-in">CHECK-IN</label>
          <input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className="date-input">
          <label htmlFor="check-out">CHECK-OUT</label>
          <input
            id="check-out"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>

      <div className="guests-dropdown">
        <label>GUESTS</label>
        <div className="guests-select">
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 10].map((num) => (
              <option key={num} value={num}>
                {num} guest{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      <button className="reserve-button">Reserve</button>

      <p className="no-charge-text">You won't be charged yet</p>

      {nights > 0 && (
        <div className="price-breakdown">
          <div className="price-item">
            <span className="underline">₹{place.price} x {nights} nights</span>
            <span>₹{place.price * nights}</span>
          </div>
          <div className="price-item">
            <span className="underline">Cleaning fee</span>
            <span>₹300</span>
          </div>
          <div className="price-item">
            <span className="underline">Service fee</span>
            <span>₹500</span>
          </div>
          <div className="price-item total">
            <span>Total before taxes</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
