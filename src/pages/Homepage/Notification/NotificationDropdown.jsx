import React, { useState } from "react";
import {
  Bell,
  Check,
  CheckAll,
  Clock,
  X,
  ChevronRight,
  Filter,
} from "react-bootstrap-icons";
import "./NotificationSystem.scss";

const NotificationDropdown = ({
  visible,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onViewAll,
}) => {
  const userRole = localStorage.getItem("userRole")
  if (!visible) return null;

  const recentNotifications = notifications?.slice(0, 3);
  const unreadCount = notifications?.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="notification-backdrop" onClick={onClose} />
      <div className={`notification-dropdown ${userRole === "user" ? "user-theme" : "provider-theme"}`}>
        <div className="notification-header">
          <div className="header-left">
            <Bell size={20} className="bell-icon" />
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={onMarkAllRead}
                title="Mark all as read"
              >
                <CheckAll size={18} />
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="notification-list">
          {recentNotifications?.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} className="empty-icon" />
              <p>No notifications yet</p>
              <span>We'll notify you when something arrives</span>
            </div>
          ) : (
            recentNotifications?.map((notification) => (
              <div
                key={notification?._id}
                className={`notification-item ${
                  !notification?.isRead ? "unread" : ""
                }`}
                onClick={() => onNotificationClick(notification?._id)}
              >
                <div className="notification-icon">
                  <Bell size={16} />
                </div>
                <div className="notification-content">
                  <p className="notification-title">
                    {notification?.title || "Notification"}
                  </p>
                  <p className="notification-message">{notification?.message}</p>
                  <div className="notification-meta">
                    <Clock size={12} />
                    <span>{formatTime(notification?.createdAt)}</span>
                  </div>
                </div>
                {!notification?.isRead && <div className="unread-dot" />}
              </div>
            ))
          )}
        </div>

        {recentNotifications?.length > 0 && (
          <div className="notification-footer">
            <button className="view-all-btn" onClick={onViewAll}>
              View All Notifications
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
 
export default NotificationDropdown;

export const formatTime = (date) => {
  if (!date) return "Just now";

  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now - notificationDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return notificationDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      notificationDate.getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  });
};
