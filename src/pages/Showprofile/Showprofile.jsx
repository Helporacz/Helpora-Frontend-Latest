import React, { useEffect, useState } from "react";
import "./ShowProfile.scss";
import { icons } from "utils/constants";
import { getDataFromLocalStorage } from "utils/helpers";
import Tabsection from "./Tabsection";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProviderServices, throwError } from "store/globalSlice";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { GoClock } from "react-icons/go";
import { LuMessageCircleMore } from "react-icons/lu";
import { FaCheck } from "react-icons/fa6";
import { BsChat } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";

const Showprofile = ({ url, text }) => {
  const dispatch = useDispatch();
  const { id: providerId } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";

  const [activeTab, setActiveTab] = useState("");
  const [providerDetails, setProviderDetails] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [lastBookingAt, setLastBookingAt] = useState(null);
  const [lastReviewAt, setLastReviewAt] = useState(null);

  const navigate = useNavigate();
  const token = getDataFromLocalStorage("token");

  const handleLoginRequired = (message) => {
    dispatch(throwError(message));
    navigate(getLocalizedPath("/sign-in", i18n.language));
  };

  const handleBookmarkToggle = () => {
    if (!token) {
      handleLoginRequired(
        t("search.loginRequired", "Please log in to continue.")
      );
      return;
    }
    setBookmarked((prev) => !prev);
  };

  const handleLeaveComment = () => {
    if (!token) {
      handleLoginRequired(
        t("search.loginRequired", "Please log in to continue.")
      );
      return;
    }
  };

  let displayText = "";
  if (text) {
    displayText = text
      .split(/\s/)
      .reduce((acc, word) => (acc += word[0]), "")
      .substring(0, 2)
      .toUpperCase();
  }

  const profileUrl = url || icons.userDefaultImage;

  useEffect(() => {
    const loadProviderData = async () => {
      try {
        const providerRes = await dispatch(getProviderServices(providerId));
        const details = providerRes?.providerServices || [];

        setProviderDetails(details);
        const providerMeta = details?.[0]?.provider || {};
        setLastBookingAt(providerMeta.lastBookingAt || null);
        setLastReviewAt(providerMeta.lastReviewAt || null);

        if (details.length > 0) {
          setActiveTab(details[0]?.service?.title);
        }
      } catch (err) {
        console.error("Error fetching provider details:", err);
      }
    };
    loadProviderData();
  }, [dispatch, providerId]);

  const tabs = providerDetails.map((item) => ({
    id: item.service._id,
    label: item.service.title,
    cz_label: item.service?.cz_title,
  }));

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  };

  return (
    <div className="p-4">
      <div className="row">
        {/* LEFT SECTION */}
        <div
          className="col-md-3 d-flex flex-column text-center left-profile-box px-5 py-3"
          style={{ borderRight: "1px solid grey" }}
        >
          <div style={{ position: "relative", width: "fit-content" }}>
            {providerDetails[0]?.provider?.profileImage ? (
              <img
                style={{ borderRadius: "5px" }}
                src={providerDetails[0]?.provider?.profileImage}
                alt={providerDetails[0]?.provider?.name}
                className="img-fluid profile-img"
                onError={(e) => (e.target.src = icons.userDefaultImage)}
              />
            ) : (
              <div className="profile-placeholder">{displayText}</div>
            )}
            <div
              onClick={handleBookmarkToggle}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                fontSize: "22px",
                color: "#fff",
              }}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </div>
          </div>

          <button
            onClick={handleLeaveComment}
            className="my-3 d-flex justify-content-center align-items-center gap-5"
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {t("showProfile.leaveComment")}
            <BsChat />
          </button>

          <div
            className="d-flex flex-column align-items-start gap-3 mt-3"
            style={{ fontSize: "15px", color: "#738a95", textAlign: "left" }}
          >
            <div className="d-flex gap-2 align-items-center">
              <GoClock />
              <p style={{ margin: 0 }}>
                {t("showProfile.lastBookingLabel")}:{" "}
                {formatDate(lastBookingAt) || t("showProfile.noBookings")}
              </p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <LuMessageCircleMore />
              <p style={{ margin: 0 }}>
                {t("showProfile.lastReviewLabel")}:{" "}
                {formatDate(lastReviewAt) || t("showProfile.noReviews")}
              </p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <FaCheck />
              <p style={{ margin: 0 }}>{t("showProfile.realExperienceNote")}</p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="col-md-9" style={{ paddingInline: "30px" }}>
          {/* DESKTOP TABS */}
          <div className="d-none d-md-flex  mb-3 tab-header">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-tab-btn ${
                  activeTab === tab.label ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.label)}
              >
                {currentLang === "cz" ? tab.cz_label : tab.label}
              </button>
            ))}
          </div>

          {/* MOBILE DROPDOWN TABS */}
          <div className="d-block d-md-none mb-3">
            <select
              className="form-select mobile-tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.label}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* TAB CONTENT */}
          <Tabsection
            url={profileUrl}
            text={text}
            providerId={providerId}
            activeTab={activeTab}
            activeService={providerDetails.find(
              (item) => item.service.title === activeTab
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Showprofile;
