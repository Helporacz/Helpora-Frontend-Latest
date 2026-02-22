import React, { useState } from "react";

const BookingModal = ({
  today,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  availableTimeSlots = [],
  isLoadingSlots = false,
  noSlotsMessage = "No available hours for this date",
  isSubmitting = false,
  note,
  setNote,
  onClose,
  onConfirm,
}) => {
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setBookingDate(selectedDate);
    setBookingTime("");
    setTimeError("");

    // Validate date on change
    if (selectedDate && selectedDate < today) {
      setDateError("Booking date must be today or a future date");
    } else {
      setDateError("");
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    setBookingTime(selectedTime);

    if (!selectedTime) {
      setTimeError("Please select a booking time");
    } else {
      setTimeError("");
    }
  };

  const handleConfirm = () => {
    if (isSubmitting) return;

    if (!bookingDate) {
      setDateError("Please select a booking date");
      return;
    }

    if (bookingDate < today) {
      setDateError("Booking date must be today or a future date");
      return;
    }

    if (!bookingTime) {
      setTimeError("Please select a booking time");
      return;
    }

    if (!availableTimeSlots.length) {
      setTimeError(noSlotsMessage);
      return;
    }

    setDateError("");
    setTimeError("");
    onConfirm();
  };

  const isConfirmDisabled =
    !bookingDate ||
    !bookingTime ||
    Boolean(dateError) ||
    Boolean(timeError) ||
    isSubmitting;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[999] tw-flex tw-items-center tw-justify-center tw-bg-black/60 tw-p-4">
      <div className="tw-w-full tw-max-w-[440px] tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-6 tw-shadow-2xl">
        <h3 className="tw-text-center tw-text-2xl tw-font-semibold tw-text-slate-900">
          Book Service
        </h3>
        <p className="tw-mt-1 tw-text-center tw-text-sm tw-text-slate-600">
          Select a booking date and add a note for the provider.
        </p>

        <div className="tw-mt-5 tw-space-y-3 tw-text-left">
          <label
            htmlFor="booking-date"
            className="tw-block tw-text-sm tw-font-semibold tw-text-slate-800"
          >
            Booking Date:
          </label>
          <input
            id="booking-date"
            type="date"
            min={today}
            value={bookingDate}
            onChange={handleDateChange}
            className={`tw-block tw-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-text-slate-900 focus:tw-outline-none ${
              dateError
                ? "tw-border-red-500 focus:tw-border-red-500"
                : "tw-border-slate-300 focus:tw-border-brand-green"
            }`}
          />
          {dateError && (
            <div className="tw-text-sm tw-font-medium tw-text-red-600">
              {dateError}
            </div>
          )}

          <label
            htmlFor="booking-time"
            className="tw-block tw-text-sm tw-font-semibold tw-text-slate-800 tw-pt-1"
          >
            Booking Time:
          </label>
          <select
            id="booking-time"
            value={bookingTime}
            onChange={handleTimeChange}
            className={`tw-block tw-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-text-slate-900 focus:tw-outline-none ${
              timeError
                ? "tw-border-red-500 focus:tw-border-red-500"
                : "tw-border-slate-300 focus:tw-border-brand-green"
            } ${
              !bookingDate || isLoadingSlots || !availableTimeSlots.length
                ? "tw-cursor-not-allowed tw-bg-slate-100 tw-text-slate-500"
                : "tw-cursor-pointer"
            }`}
            disabled={!bookingDate || isLoadingSlots || !availableTimeSlots.length}
          >
            <option value="">
              {!bookingDate
                ? "Select booking date first"
                : isLoadingSlots
                ? "Loading available hours..."
                : !availableTimeSlots.length
                ? noSlotsMessage
                : "Select booking time"}
            </option>
            {availableTimeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {bookingDate && !isLoadingSlots && !availableTimeSlots.length && (
            <div className="tw-text-sm tw-text-slate-500">
              {noSlotsMessage}
            </div>
          )}
          {timeError && (
            <div className="tw-text-sm tw-font-medium tw-text-red-600">
              {timeError}
            </div>
          )}

          <label
            htmlFor="booking-note"
            className="tw-block tw-text-sm tw-font-semibold tw-text-slate-800 tw-pt-1"
          >
            Note (optional):
          </label>
          <textarea
            id="booking-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter any note for provider..."
            rows="3"
            className="tw-block tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2.5 tw-text-sm tw-text-slate-900 focus:tw-border-brand-green focus:tw-outline-none"
          />
        </div>

        <div className="tw-mt-6 tw-flex tw-items-center tw-justify-between tw-gap-3">
          <button
            type="button"
            className="tw-inline-flex tw-h-10 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-text-sm tw-font-semibold tw-text-slate-700 tw-transition hover:tw-bg-slate-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
            className="tw-inline-flex tw-h-10 tw-items-center tw-justify-center tw-rounded-lg tw-bg-[#112d58] tw-px-4 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-[#0b2142] disabled:tw-cursor-not-allowed disabled:tw-bg-slate-400"
          >
            {isSubmitting ? (
              <>
                <span
                  className="tw-mr-2 tw-inline-block tw-h-4 tw-w-4 tw-animate-spin tw-rounded-full tw-border-2 tw-border-white tw-border-t-transparent"
                  aria-hidden="true"
                />
                Confirming...
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
