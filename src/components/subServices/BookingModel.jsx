import React, { useState } from "react";
import "./BookingModal.css";

const BookingModal = ({
  today,
  bookingDate,
  setBookingDate,
  note,
  setNote,
  onClose,
  onConfirm,
}) => {
  const [dateError, setDateError] = useState("");

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setBookingDate(selectedDate);
    
    // Validate date on change
    if (selectedDate && selectedDate < today) {
      setDateError("Booking date must be today or a future date");
    } else {
      setDateError("");
    }
  };

  const handleConfirm = () => {
    if (!bookingDate) {
      setDateError("Please select a booking date");
      return;
    }

    if (bookingDate < today) {
      setDateError("Booking date must be today or a future date");
      return;
    }

    setDateError("");
    onConfirm();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="booking-modal animate-fadeIn">
        <h3 className="modal-title">Book Service</h3>
        <p className="modal-subtitle">
          Select a booking date and add a note for the provider.
        </p>

        <div className="modal-body-custom">
          <label className="form-label fw-bold">Booking Date:</label>
          <input
            type="date"
            min={today}
            value={bookingDate}
            onChange={handleDateChange}
            className={`form-control-custom ${dateError ? "border-danger" : ""}`}
            style={dateError ? { borderColor: "#dc3545" } : {}}
          />
          {dateError && (
            <div className="text-danger mt-1" style={{ fontSize: "14px" }}>
              {dateError}
            </div>
          )}

          <label className="form-label fw-bold mt-3">Note (optional):</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter any note for provider..."
            rows="3"
            className="form-control-custom"
          />
        </div>

        <div className="modal-footer-custom">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            className={`btn-confirm ${!bookingDate ? "btn-disabled" : ""}`}
            disabled={!bookingDate}
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
