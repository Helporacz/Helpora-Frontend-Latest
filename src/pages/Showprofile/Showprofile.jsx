import React, { useEffect, useState } from "react";
import "./ShowProfile.scss";
import { icons } from "utils/constants";
import { getDataFromLocalStorage } from "utils/helpers";
import Tabsection from "./Tabsection";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProviderServices, throwError } from "store/globalSlice";
import { FaBookmark, FaRegBookmark, FaUserCircle } from "react-icons/fa";
import { GoClock } from "react-icons/go";
import { LuMessageCircleMore } from "react-icons/lu";
import { FaCheck } from "react-icons/fa6";
import { BsChat } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";

const Showprofile = ({ text }) => {
  const dispatch = useDispatch();
  const { id: providerId } = useParams();
  const { t, i18n } = useTranslation();
  const normalizedLang = (i18n.resolvedLanguage || i18n.language || "en")
    .toLowerCase()
    .split("-")[0];
  const currentLang =
    normalizedLang === "cs" ? "cz" : normalizedLang === "ru" ? "ru" : "en";

  const [activeTabId, setActiveTabId] = useState("");
  const [providerDetails, setProviderDetails] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [lastBookingAt, setLastBookingAt] = useState(null);
  const [lastReviewAt, setLastReviewAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const loadProviderData = async () => {
      setIsLoading(true);
      try {
        const providerRes = await dispatch(getProviderServices(providerId));
        const details = providerRes?.providerServices || [];

        setProviderDetails(details);
        const providerMeta = details?.[0]?.provider || {};
        setLastBookingAt(providerMeta.lastBookingAt || null);
        setLastReviewAt(providerMeta.lastReviewAt || null);

        if (details.length > 0) {
          setActiveTabId(details[0]?.service?._id || "");
        }
      } catch (err) {
        console.error("Error fetching provider details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProviderData();
  }, [dispatch, providerId, currentLang]);

  const tabs = providerDetails
    .filter((item) => item?.service?._id)
    .map((item) => ({
      id: item.service._id,
      label: item.service.title,
      cz_label: item.service?.cz_title,
      ru_label: item.service?.ru_title,
    }));

  const getServiceLabel = (tab) => {
    if (currentLang === "ru") {
      return tab?.ru_label || tab?.label || tab?.cz_label || "";
    }
    if (currentLang === "cz") {
      return tab?.cz_label || tab?.label || tab?.ru_label || "";
    }
    return tab?.label || tab?.cz_label || tab?.ru_label || "";
  };

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="p-4 show-profile-skeleton">
        <div className="row">
          <div
            className="col-md-3 d-flex flex-column text-center left-profile-box px-5 py-3"
            style={{ borderRight: "1px solid grey" }}
          >
            <div className="skeleton-shimmer profile-skeleton-avatar" />
            <div className="skeleton-shimmer profile-skeleton-button my-3" />
            <div className="profile-skeleton-meta">
              <div className="skeleton-shimmer profile-skeleton-line" />
              <div className="skeleton-shimmer profile-skeleton-line" />
              <div className="skeleton-shimmer profile-skeleton-line short" />
            </div>
          </div>

          <div className="col-md-9" style={{ paddingInline: "30px" }}>
            <div className="d-none d-md-flex mb-3 profile-skeleton-tabs">
              <div className="skeleton-shimmer profile-skeleton-tab" />
              <div className="skeleton-shimmer profile-skeleton-tab" />
              <div className="skeleton-shimmer profile-skeleton-tab" />
            </div>
            <div className="d-block d-md-none mb-3">
              <div className="skeleton-shimmer profile-skeleton-mobile-tab" />
            </div>

            <div className="profile-skeleton-content">
              <div className="skeleton-shimmer profile-skeleton-title" />
              <div className="skeleton-shimmer profile-skeleton-line" />
              <div className="skeleton-shimmer profile-skeleton-line" />
              <div className="skeleton-shimmer profile-skeleton-line short" />
              <div className="skeleton-shimmer profile-skeleton-card" />
              <div className="skeleton-shimmer profile-skeleton-card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div
                className="profile-placeholder"
                aria-label={t("profile.noImage", "No Image")}
                title={t("profile.noImage", "No Image")}
              >
                <FaUserCircle className="profile-placeholder-icon" />
                {!providerDetails[0]?.provider?.name && displayText && (
                  <span className="profile-placeholder-text">{displayText}</span>
                )}
              </div>
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
                  activeTabId === tab.id ? "active" : ""
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {getServiceLabel(tab)}
              </button>
            ))}
          </div>

          {/* MOBILE DROPDOWN TABS */}
          <div className="d-block d-md-none mb-3">
            <select
              className="form-select mobile-tab-select"
              value={activeTabId}
              onChange={(e) => setActiveTabId(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {getServiceLabel(tab)}
                </option>
              ))}
            </select>
          </div>

          {/* TAB CONTENT */}
          <Tabsection
            activeService={providerDetails.find(
              (item) => item?.service?._id === activeTabId
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Showprofile;
