import React, { useEffect, useState } from "react";
import { FiBell, FiCheck, FiClock } from "react-icons/fi";
import { BsCheckAll } from "react-icons/bs";
import "./NotificationPage.scss";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getNotification,
  readAllNotification,
  readNotification,
} from "store/globalSlice";
import { getLocalizedPath } from "utils/localizedRoute";

const NotificationPage = () => {
  const { adminData } = useSelector((state) => {
    return {
      adminData: state.global.adminData,
    };
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [notificationCount, setNotificationCount] = useState(0);
  const [notification, setNotification] = useState([]);

  const userRole = localStorage.getItem("userRole");
  useEffect(() => {
    if (!adminData?._id) return;

    const fetchData = async () => {
      try {
        const res = await dispatch(getNotification());
        if (res?.success) {
          setNotification(res.notifications || []);

          const unreadCount =
            res.notifications?.filter((n) => !n.isRead).length || 0;
          setNotificationCount(unreadCount);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchData();
  }, [dispatch, adminData?._id]);

  const handleNotificationClick = async (notif) => {
    const id = notif._id || notif;
    const notificationData = typeof notif === 'object' ? notif : 
      notification.find((n) => n._id === id);

    if (!notificationData) return;

    try {
      // Mark as read if not already read
      if (!notificationData.isRead) {
        const res = await dispatch(readNotification(id));

        if (res?.success) {
          setNotification((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
          );

          setNotificationCount((prev) => Math.max(prev - 1, 0));
        }
      }

      // Redirect based on notification type
      if (notificationData?.type) {
        const type = notificationData.type;
        const language = i18n.language;

        if (type === "kyc_submitted") {
          // Admin: redirect to KYC approval page
          window.location.href = getLocalizedPath("/kyc-approval", language);
        } else if (
          type === "kyc_approved" ||
          type === "kyc_rejected" ||
          type === "kyc_resubmit"
        ) {
          // Provider: redirect to KYC process page
          window.location.href = getLocalizedPath("/kyc-process", language);
        } else if (
          type === "booking" ||
          type === "accepted" ||
          type === "rejected" ||
          type === "completed"
        ) {
          // User/Provider: redirect to bookings page
          window.location.href = getLocalizedPath("/orders", language);
        }
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await dispatch(readAllNotification());

      if (res?.success) {
        // Update UI
        setNotification((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredNotifications = notification.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  return (
    <>
      {/* <div className="notification-page"> */}
      <div
        className={`notification-page ${
          userRole === "user" ? "user-theme" : "provider-theme"
        }`}
      >
        <div className="page-header">
          <div className="header-top">
            <h1>Notifications</h1>
            {notificationCount > 0 && (
              <button className="mark-all-page-btn" onClick={handleMarkAllRead}>
                <BsCheckAll size={18} />
                Mark all as read
              </button>
            )}
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All <span className="count">{notification.length}</span>
            </button>
            <button
              className={`filter-tab ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread <span className="count">{notificationCount}</span>
            </button>
            <button
              className={`filter-tab ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}
            >
              Read{" "}
              <span className="count">
                {notification.length - notificationCount}
              </span>
            </button>
          </div>
        </div>

        <div className="notifications-container">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state-page">
              <FiBell size={64} className="empty-icon" />
              <h2>No {filter !== "all" ? filter : ""} notifications</h2>
              <p>You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="notifications-grid">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-card ${
                    !notif.isRead ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="card-header">
                    <div
                      className={
                        userRole === "user"
                          ? "notification-icon-large"
                          : "provider-color"
                      }
                    >
                      <FiBell size={20} />
                    </div>
                    {!notif.isRead && <div className="unread-indicator" />}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">
                      {notif.title || "Notification"}
                    </h3>
                    <p className="card-message">{notif.message}</p>
                    <div className="card-footer">
                      <div className="time-stamp">
                        <FiClock size={14} />
                        <span>{formatTime(notif.createdAt)}</span>
                      </div>
                      {notif.isRead && (
                        <div className="read-badge">
                          <FiCheck size={12} />
                          Read
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPage;
