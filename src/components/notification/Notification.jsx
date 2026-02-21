import React, { useState } from "react";
import {
    COffcanvas,
    COffcanvasHeader,
    COffcanvasBody,
    COffcanvasTitle,
    CCloseButton,
} from "@coreui/react";

const TAB_ACTIVE_COLOR = "#007bff";

const NotificationPanel = ({
    visible,
    onClose,
    notifications = [],
    onMarkAllRead,
    onNotificationClick
}) => {
    const [activeTab, setActiveTab] = useState("all");

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const displayedNotifications =
        activeTab === "all" ? notifications : unreadNotifications;

    const tabButtonStyle = (isActive) => ({
        padding: "10px",
        backgroundColor: "#fff",
        color: isActive ? TAB_ACTIVE_COLOR : "#000",
        border: "none",
        cursor: "pointer",
        borderBottom: isActive ? `2px solid ${TAB_ACTIVE_COLOR}` : "2px solid transparent",
    });

    return (
        <COffcanvas placement="end" visible={visible} onHide={onClose}>
            <COffcanvasHeader>
                <COffcanvasTitle>Notifications</COffcanvasTitle>
                <CCloseButton className="text-reset" onClick={onClose} />
            </COffcanvasHeader>

            <COffcanvasBody style={{ maxHeight: "100vh", overflowY: "auto", borderTop:"1px solid gray" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                    }}
                >
                    {/* Tabs */}
                    <div style={{ display: "flex", flex: 1 }}>
                        <button
                            style={tabButtonStyle(activeTab === "all")}
                            onClick={() => setActiveTab("all")}
                        >
                            All
                        </button>

                        <button
                            style={tabButtonStyle(activeTab === "unread")}
                            onClick={() => setActiveTab("unread")}
                        >
                            Unread {unreadNotifications.length > 0 ? (unreadNotifications.length) : ""}
                        </button>
                    </div>

                    {unreadNotifications.length > 0 && (
                        <button
                            onClick={onMarkAllRead}
                            style={{
                                marginLeft: "10px",
                                padding: "8px 12px",
                                backgroundColor: "#fff",
                                color: TAB_ACTIVE_COLOR,
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notification List */}
                {displayedNotifications.length === 0 ? (
                    <p className="text-muted">No notifications available</p>
                ) : (
                    displayedNotifications.map((item, index) => {

                        return (

                            <div
                                key={index}
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #ddd",
                                    background: !item.isRead ? "#f0f8ff" : "transparent",
                                }}
                                onClick={() => onNotificationClick && onNotificationClick(item._id)}
                            >
                                <strong>{item.title || "Notification"}</strong>
                                <p style={{ marginBottom: 0 }}>{item.message}</p>
                            </div>
                        )
                    })
                )}
            </COffcanvasBody>
        </COffcanvas>
    );
};

export default NotificationPanel;
