import MessagePopup from "components/layouts/MessagePopup/MessagePopup";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBooking,
  getProviderAvailabilitySlotsAPI,
  getProviderServiceById
} from "store/globalSlice";
import { getDataFromLocalStorage } from "utils/helpers";
import clean from "../../assets/images/clean.jpg";
import "./Subservice.scss";

const ServiceDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [service, setService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [bookingTimeMessage, setBookingTimeMessage] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [note, setNote] = useState("");
  const [messagePopup, setMessagePopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });
  const navigate = useNavigate();
  const token = getDataFromLocalStorage("token");
  const handleBookingClick = () => {
    if (!token) {
      navigate("/sign-in");
    } else {
      setBookingDate("");
      setBookingTime("");
      setAvailableTimeSlots([]);
      setBookingTimeMessage("");
      setNote("");
      setDateError("");
      setTimeError("");
      setIsSubmittingBooking(false);
      setShowModal(true);
    }
  };

  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

  const resolveProviderId = (providerServiceData) => {
    const providerValue = providerServiceData?.provider;
    if (!providerValue) return "";
    if (typeof providerValue === "string") return providerValue;
    return providerValue?._id || providerValue?.id || "";
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setBookingDate("");
    setBookingTime("");
    setAvailableTimeSlots([]);
    setLoadingTimeSlots(false);
    setBookingTimeMessage("");
    setNote("");
    setDateError("");
    setTimeError("");
    setIsSubmittingBooking(false);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setBookingDate(selectedDate);
    setBookingTime("");
    setTimeError("");

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

  const confirmBooking = async () => {
    if (isSubmittingBooking) return;

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
      setTimeError(bookingTimeMessage || "No available hours for this date");
      return;
    }

    setDateError("");
    setTimeError("");
    setIsSubmittingBooking(true);

    try {
      const response = await dispatch(
        createBooking({
          providerServiceId: service._id,
          bookingDate,
          bookingTime,
          preferredTime: bookingTime,
          totalPrice: service.price,
          notes: note,
        })
      );
      if (response?.status === 200) {
        setMessagePopup({
          show: true,
          title: "Success",
          message: "Booking successfully!",
          type: "success",
        });
        handleCloseModal();
      } else {
        setMessagePopup({
          show: true,
          title: "Booking Failed",
          message:
            response?.message || "Failed to create booking. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setMessagePopup({
        show: true,
        title: "Error",
        message: "Booking failed! Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await dispatch(getProviderServiceById(id));
        const data = response?.data;
        setService(data);
      } catch (error) {
        console.error("Error fetching service:", error);
      }
    };
    fetchService();
  }, [dispatch, id]);

  useEffect(() => {
    let isMounted = true;

    const fetchAvailableTimeSlots = async () => {
      if (!showModal || !bookingDate || !service) {
        if (isMounted) {
          setAvailableTimeSlots([]);
          setLoadingTimeSlots(false);
          if (!bookingDate) {
            setBookingTimeMessage("");
          }
        }
        return;
      }

      const providerId = resolveProviderId(service);
      if (!providerId) {
        if (isMounted) {
          setAvailableTimeSlots([]);
          setLoadingTimeSlots(false);
          setBookingTimeMessage("No available hours for this date");
        }
        return;
      }

      setLoadingTimeSlots(true);
      const response = await dispatch(
        getProviderAvailabilitySlotsAPI(providerId, bookingDate)
      );

      if (!isMounted) return;

      const slotsFromApi = Array.isArray(response?.timeSlots)
        ? response.timeSlots
        : Array.isArray(response?.slots)
        ? response.slots
            .map((slot) => slot?.start)
            .filter((slot) => typeof slot === "string" && slot.trim())
        : [];

      setAvailableTimeSlots(slotsFromApi);
      setBookingTimeMessage(
        slotsFromApi.length ? "" : "No available hours for this date"
      );
      setLoadingTimeSlots(false);
    };

    fetchAvailableTimeSlots();

    return () => {
      isMounted = false;
    };
  }, [dispatch, showModal, bookingDate, service]);

  if (!service) return <p>Loading...</p>;
  const today = new Date().toISOString().split("T")[0];

  const providerService = service?.service;
  return (
    <>
      <MessagePopup
        show={messagePopup.show}
        onHide={() => setMessagePopup({ ...messagePopup, show: false })}
        title={messagePopup.title}
        message={messagePopup.message}
        type={messagePopup.type}
      />
      <section id="service-details">
        <div className="title-text p-0">
          <h1 className=" ">{service.title}</h1>
        </div>
        <div className="container" style={{ padding: "40px 20px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "40px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Product Image */}
            <div
              style={{
                flex: "1 1 45%",
                textAlign: "center",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                background: "#fff",
              }}
            >
              <img
                src={service.image || service?.service?.image || service?.service?.category?.image || clean}
                alt={service.service.title}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            </div>

            {/* Product Details */}
            <div
              style={{
                flex: "1 1 45%",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                className="color-black"
                style={{
                  fontFamily: "'League Spartan'",
                }}
              >
                {service?.service?.title}
              </h2>

              <p style={{ fontSize: "22px", color: "#555" }}>
                <strong
                  style={{
                    fontFamily: "'League Spartan'",
                  }}
                >
                  Provider:
                </strong>{" "}
                {service?.provider?.name || "N/A"}
              </p>

              <p style={{ fontSize: "22px", color: "#555" }}>
                <strong
                  style={{
                    fontFamily: "'League Spartan'",
                  }}
                >
                  Description:
                </strong>
                {providerService?.description || "No description available."}
              </p>

              <p style={{ fontSize: "24px", color: "#555" }}>
                <strong
                  style={{
                    fontFamily: "'League Spartan'",
                  }}
                >
                  Price:
                </strong>{" "}
                <span
                  style={{
                    color: "#28a745",
                    fontWeight: "600",
                    fontFamily: "'League Spartan'",
                  }}
                >
                  CZK {service.price}
                </span>
              </p>

              <p
                style={{
                  fontSize: "22px",
                  color: "#555",
                  fontFamily: "'League Spartan'",
                }}
              >
                <strong
                  style={{
                    fontFamily: "'League Spartan'",
                  }}
                >
                  Category:
                </strong>{" "}
                {providerService?.category?.map((c) => c.name).join(", ") ||
                  "Uncategorized"}
              </p>

              <button
                className="setbuttonhover"
                onClick={handleBookingClick}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: "50%",
                  display: "block",
                  margin: "0 auto",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#ff7d7d")}
              >
                Book Service
              </button>
            </div>
          </div>

          {/* Booking Modal */}
          {showModal && (
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
                    htmlFor="service-details-booking-date"
                    className="tw-block tw-text-sm tw-font-semibold tw-text-slate-800"
                  >
                    Booking Date:
                  </label>
                  <input
                    id="service-details-booking-date"
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
                    htmlFor="service-details-booking-time"
                    className="tw-block tw-text-sm tw-font-semibold tw-text-slate-800 tw-pt-1"
                  >
                    Booking Time:
                  </label>
                  <select
                    id="service-details-booking-time"
                    value={bookingTime}
                    onChange={handleTimeChange}
                    className={`tw-block tw-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-text-slate-900 focus:tw-outline-none ${
                      timeError
                        ? "tw-border-red-500 focus:tw-border-red-500"
                        : "tw-border-slate-300 focus:tw-border-brand-green"
                    } ${
                      !bookingDate || loadingTimeSlots || !availableTimeSlots.length
                        ? "tw-cursor-not-allowed tw-bg-slate-100 tw-text-slate-500"
                        : "tw-cursor-pointer"
                    }`}
                    disabled={
                      !bookingDate ||
                      loadingTimeSlots ||
                      !availableTimeSlots.length
                    }
                  >
                    <option value="">
                      {!bookingDate
                        ? "Select booking date first"
                        : loadingTimeSlots
                        ? "Loading available hours..."
                        : !availableTimeSlots.length
                        ? bookingTimeMessage || "No available hours for this date"
                        : "Select booking time"}
                    </option>
                    {availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {bookingDate && !loadingTimeSlots && !availableTimeSlots.length && (
                    <div className="tw-text-sm tw-text-slate-500">
                      {bookingTimeMessage || "No available hours for this date"}
                    </div>
                  )}
                  {timeError && (
                    <div className="tw-text-sm tw-font-medium tw-text-red-600">
                      {timeError}
                    </div>
                  )}

                  <label
                    htmlFor="service-details-booking-note"
                    className="tw-block tw-text-sm tw-font-semibold tw-text-slate-800 tw-pt-1"
                  >
                    Note (optional):
                  </label>
                  <textarea
                    id="service-details-booking-note"
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
                    onClick={handleCloseModal}
                    disabled={isSubmittingBooking}
                    className="tw-inline-flex tw-h-10 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-text-sm tw-font-semibold tw-text-slate-700 tw-transition hover:tw-bg-slate-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmBooking}
                    disabled={!bookingDate || !bookingTime || isSubmittingBooking}
                    className="tw-inline-flex tw-h-10 tw-items-center tw-justify-center tw-rounded-lg tw-bg-[#112d58] tw-px-4 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-[#0b2142] disabled:tw-cursor-not-allowed disabled:tw-bg-slate-400"
                  >
                    {isSubmittingBooking ? (
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
          )}
        </div>
      </section>
    </>
  );
};

export default ServiceDetails;
