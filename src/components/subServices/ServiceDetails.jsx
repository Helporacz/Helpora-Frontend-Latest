import MessagePopup from "components/layouts/MessagePopup/MessagePopup";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBooking,
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
      setShowModal(true);
    }
  };

  const [dateError, setDateError] = useState("");

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setBookingDate(selectedDate);

    if (selectedDate && selectedDate < today) {
      setDateError("Booking date must be today or a future date");
    } else {
      setDateError("");
    }
  };

  const confirmBooking = async () => {
    if (!bookingDate) {
      setDateError("Please select a booking date");
      return;
    }

    if (bookingDate < today) {
      setDateError("Booking date must be today or a future date");
      return;
    }

    setDateError("");

    try {
      const response = await dispatch(
        createBooking({
          providerServiceId: service._id,
          bookingDate: new Date(bookingDate),
          totalPrice: service.price,
        })
      );
      if (response?.status === 200) {
        setMessagePopup({
          show: true,
          title: "Success",
          message: "Booking successfully!",
          type: "success",
        });
        setShowModal(false);
        setBookingDate("");
        setNote("");
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
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 99,
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "10px",
                  width: "400px",
                  maxWidth: "90%",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                <h3 style={{ marginBottom: "10px", color: "#333" }}>
                  Book Service
                </h3>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  Select a booking date and add a note for the provider.
                </p>

                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    textAlign: "left",
                  }}
                >
                  <label>
                    <strong>Booking Date:</strong>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={bookingDate}
                    onChange={handleDateChange}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: dateError
                        ? "1px solid #dc3545"
                        : "1px solid #ccc",
                      width: "100%",
                    }}
                  />
                  {dateError && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "14px" }}
                    >
                      {dateError}
                    </div>
                  )}

                  <label>
                    <strong>Note (optional):</strong>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter any note for provider..."
                    rows="3"
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "25px",
                  }}
                >
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBooking}
                    disabled={!bookingDate}
                    style={{
                      backgroundColor: !bookingDate ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      cursor: !bookingDate ? "not-allowed" : "pointer",
                    }}
                  >
                    Confirm
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
