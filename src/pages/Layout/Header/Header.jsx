import UserProfileLayout from "components/layouts/UserProfileLayout/UserProfileLayout";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosNotifications } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import GoogleTranslate from "components/GoogleTranslate/GoogleTranslate";
import NotificationDropdown from "pages/Homepage/Notification/NotificationDropdown";
import { ChevronDown } from "react-bootstrap-icons";
import { io } from "socket.io-client";
import {
  getNotification,
  handelLogout,
  readAllNotification,
  readNotification,
} from "store/globalSlice";
import { icons } from "utils/constants";
import "./Header.scss";
import { getLocalizedPath } from "utils/localizedRoute";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
  transports: ["websocket"],
});

const Header = ({ headerText }) => {
  const { t, i18n } = useTranslation();
  const { adminData } = useSelector((state) => {
    return {
      adminData: state.global.adminData,
    };
  });

  const { role, name, firstName, lastName, profileImage } = adminData || {};
  const isAdmin = role === "superAdmin";

  const myRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProfile, setIsProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notification, setNotification] = useState();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  useEffect(() => {
    if (!adminData?._id) return;

    socket.emit("join", String(adminData._id));

    const handleNewNotification = (newNoti) => {
      console.log("New notification received:", newNoti);
      setNotification((prev) => {
        const exists = prev?.some((n) => n._id === newNoti._id);
        if (exists) return prev;
        return [newNoti, ...(prev || [])];
      });
      if (!newNoti.isRead) {
        setNotificationCount((prev) => prev + 1);
      }
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [adminData?._id]);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (myRef.current && !myRef.current.contains(e.target)) {
        setIsProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = isAdmin
    ? `${firstName || ""} ${lastName || ""}`.trim()
    : name;

  const handleNotificationClick = async (notification) => {
    const id = notification._id || notification;
    const notificationData =
      typeof notification === "object"
        ? notification
        : notification?.find((n) => n._id === id);

    try {
      const res = await dispatch(readNotification(id));

      if (res?.success) {
        setNotification((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );

        setNotificationCount((prev) => prev - 1);
      }

      if (notificationData?.type) {
        const type = notificationData.type;
        const language = i18n.language;

        if (type === "kyc_submitted") {
          window.location.href = getLocalizedPath("/kyc-approval", language);
        } else if (
          type === "kyc_approved" ||
          type === "kyc_rejected" ||
          type === "kyc_resubmit"
        ) {
          window.location.href = getLocalizedPath("/kyc-process", language);
        } else if (
          type === "booking" ||
          type === "accepted" ||
          type === "rejected" ||
          type === "completed"
        ) {
          window.location.href = getLocalizedPath("/orders", language);
        }
      }

      setIsNotificationPanelOpen(false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await dispatch(readAllNotification());

      if (res?.success) {
        setNotification((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  return (
    <div id="header-container" className="position-relative">
      <div className="cps-24 d-flex gap-4 align-items-center">
        <img
          src={icons.back}
          alt="back"
          className="pointer"
          onClick={() => navigate(-1)}
        />
        {headerText && (
          <div className="text-20-700 color-black-100">{headerText}</div>
        )}
      </div>

      <div className="right-header-block">
        <div
          style={{
            position: "relative",
            marginRight: "20px",
            cursor: "pointer",
          }}
          onClick={() => setIsNotificationPanelOpen(true)}
        >
          <IoIosNotifications size={28} />

          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-4px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "1px 5px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {notificationCount}
            </span>
          )}
        </div>

        <GoogleTranslate />

        <div className="profile-header-block">
          <UserProfileLayout
            isRounded
            text={displayName}
            url={profileImage}
            size="50"
          />
        </div>

        <div className="user-name-header-block" ref={myRef}>
          <div
            className="name-block"
            onClick={() => setIsProfile((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <span>{displayName}</span>

            <span className="d-flex pointer align-items-center">
              <ChevronDown
                className={`chevron-icon ${isProfile ? "rotate-up" : ""}`}
                size={18}
              />
            </span>

            {isProfile && (
              <div className="profile-option-block shadow">
                <div
                  className="item-block"
                  onClick={() => navigate("/admins/profile-details/my")}
                >
                  <span className="icon-c-block">
                    <img src={icons.profile} alt="profile" />
                  </span>
                  <span>{t("header.profile")}</span>
                </div>

                <div
                  className="item-block"
                  onClick={() => {
                    dispatch(handelLogout()),
                      getLocalizedPath("/", i18n.language);
                  }}
                >
                  <span className="icon-c-block">
                    <img src={icons.logout} alt="logout" />
                  </span>
                  <span>{t("header.logout")}</span>
                </div>
              </div>
            )}
          </div>

          <div className="role-block">{adminData?.role}</div>
        </div>

        <NotificationDropdown
          visible={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
          notifications={notification}
          onNotificationClick={(id) => {
            const notif = notification?.find((n) => n._id === id);
            handleNotificationClick(notif || id);
          }}
          onMarkAllRead={handleMarkAllRead}
          onViewAll={() => {
            navigate(getLocalizedPath("/notifications", i18n.language));
            setIsNotificationPanelOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default Header;
