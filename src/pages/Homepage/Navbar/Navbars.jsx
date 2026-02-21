import GoogleTranslate from "components/GoogleTranslate/GoogleTranslate";
import UserProfileLayout from "components/layouts/UserProfileLayout";
import { useEffect, useRef, useState } from "react";
import { List, X } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { IoIosNotifications } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  getNotification,
  getUserProfile,
  handelLogout,
  readAllNotification,
  readNotification,
} from "store/globalSlice";
import { commonRoute } from "utils/constants";
import icons from "utils/constants/icons";
import { getDataFromLocalStorage } from "utils/helpers";
import { getLocalizedPath } from "utils/localizedRoute";
import NotificationDropdown from "../Notification/NotificationDropdown";
import "./Navbars.scss";

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
});

const Navbars = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notification, setNotification] = useState([]);
  const profileRef = useRef();
  const token = getDataFromLocalStorage("token");
  const userId = localStorage.getItem("userId");

  const { adminData } = useSelector((state) => ({
    adminData: state.global.adminData,
  }));
  
  const userData = adminData || {};

  useEffect(() => {
    if (!userId) return;

    socket.emit("join", String(userId));

    const handleNewNotification = (newNoti) => {
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
  }, [userId]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!token || !userId) return;
    const getData = async () => {
      const res = await dispatch(getUserProfile(userId));
      if (res?.status !== 200) {
        console.error("Failed to fetch user profile");
      }
    };
    getData();
  }, [dispatch, token, userId]);

  useEffect(() => {
    if (!token) return;
    const fetchNoti = async () => {
      const res = await dispatch(getNotification());
      if (res?.success) {
        setNotification(res.notifications || []);
        const count = res.notifications?.filter((n) => !n.isRead).length || 0;
        setNotificationCount(count);
      }
    };
    fetchNoti();
  }, [dispatch, token]);

  const handleNotificationClick = async (notification) => {
    const id = notification._id || notification;
    const notificationData = typeof notification === 'object' ? notification : 
      notification?.find((n) => n._id === id);

    try {
      const res = await dispatch(readNotification(id));
      if (res?.success) {
        setNotification((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setNotificationCount((prev) => Math.max(prev - 1, 0));
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
          window.location.href = getLocalizedPath("/my-bookings", language);
        }
      }

      setIsNotificationPanelOpen(false);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAllRead = async () => {
    const res = await dispatch(readAllNotification());
    if (res?.success) {
      setNotification((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setNotificationCount(0);
    }
  };

  //for close hamburger in small screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="modern-navbar shadow-sm bg-white border-bottom">
        <div
          className="container-fluid px-4 px-md-5 py-2 d-flex align-items-center justify-content-around"
          style={{ flexWrap: "wrap", width: "100%" }}
        >
          <div className="navbar-brand-modern">
            <NavLink to={getLocalizedPath(commonRoute.home, i18n.language)}>
              <img src={icons.logo} alt="Logo" height="60" />
            </NavLink>
          </div>

          <ul className="nav-links-desktop d-none d-lg-flex align-items-center gap-5 mb-0">
            <li>
              <NavLink
                to={getLocalizedPath(commonRoute.home, i18n.language)}
                className="nav-link-modern"
                end
              >
                {t("navbar.home")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to={getLocalizedPath(commonRoute.service, i18n.language)}
                className="nav-link-modern"
              >
                {t("navbar.services")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to={getLocalizedPath(commonRoute.about, i18n.language)}
                className="nav-link-modern"
              >
                {t("navbar.about")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to={getLocalizedPath("/contact", i18n.language)}
                className="nav-link-modern"
              >
                {t("navbar.contact")}
              </NavLink>
            </li>
            {token && (
              <li>
                <NavLink
                  to={getLocalizedPath(commonRoute.chat, i18n.language)}
                  className="nav-link-modern"
                >
                  {t("navbar.message")}
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {token && (
              <div
                className="notification-bell position-relative cursor-pointer"
                style={{ marginRight: "20px" }}
                onClick={() => setIsNotificationPanelOpen(true)}
              >
                <IoIosNotifications size={26} className="text-dark" />
                {notificationCount > 0 && (
                  <span className="notification-badge-modern">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
            )}

            <GoogleTranslate />

            {token ? (
              <div className="profile-dropdown-wrapper" ref={profileRef}>
                <div
                  className="profile-trigger d-flex align-items-center gap-2 cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <UserProfileLayout
                    isRounded
                    text={userData.name || "JD"}
                    url={userData.profileImage || ""}
                    size="42"
                  />
                  <span className="username-text d-none d-md-block fw-medium">
                    {userData.name || "User"}
                  </span>
                  <FiChevronDown
                    size={20}
                    className={`text-muted transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isProfileOpen && (
                  <div className="profile-menu-modern shadow-lg border-0 rounded-3">
                    <div
                      className="dropdown-item-modern d-flex align-items-center gap-2"
                      onClick={() => {
                        navigate(
                          getLocalizedPath("/user/profile", i18n.language)
                        );
                        setIsProfileOpen(false);
                      }}
                    >
                      <FiUser size={18} /> {t("section38.text1")}
                    </div>
                    <div
                      className="dropdown-item-modern d-flex align-items-center gap-2"
                      onClick={() => {
                        navigate(
                          getLocalizedPath("/my-bookings", i18n.language)
                        );
                        setIsProfileOpen(false);
                      }}
                    >
                      <FiSettings size={18} /> {t("section38.text2")}
                    </div>
                    <hr className="dropdown-divider my-2" />
                    <div
                      className="dropdown-item-modern d-flex align-items-center gap-2 text-danger"
                      onClick={() => dispatch(handelLogout())}
                    >
                      <FiLogOut size={18} /> {t("section38.text3")}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() =>
                  navigate(getLocalizedPath(commonRoute.logins, i18n.language))
                }
                className="login-button"
              >
                {t("section38.text4")}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="btn btn-link text-dark d-lg-none ms-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <List size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar-modern ${isMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header-modern d-flex justify-content-between align-items-center p-4 border-bottom">
          {/* <h5 className="mb-0 fw-bold">Menu</h5> */}
          <div className="navbar-brand-modern">
            <NavLink to={getLocalizedPath("/", i18n.language)}>
              <img src={icons.logo} alt="Logo" height="60" />
            </NavLink>
          </div>
          <X
            size={30}
            className="cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
        <ul className="sidebar-links-modern list-unstyled p-4 pt-3">
          <li className="mb-3">
            <NavLink
              to={getLocalizedPath(commonRoute.home, i18n.language)}
              onClick={() => setIsMenuOpen(false)}
              className="sidebar-link"
              end
            >
              {t("navbar.home")}
            </NavLink>
          </li>
          <li className="mb-3">
            <NavLink
              to={getLocalizedPath(commonRoute.service, i18n.language)}
              onClick={() => setIsMenuOpen(false)}
              className="sidebar-link"
            >
              {t("navbar.services")}
            </NavLink>
          </li>
          <li className="mb-3">
            <NavLink
              to={getLocalizedPath(commonRoute.about, i18n.language)}
              onClick={() => setIsMenuOpen(false)}
              className="sidebar-link"
            >
              {t("navbar.about")}
            </NavLink>
          </li>
          <li className="mb-3">
            <NavLink
              to={getLocalizedPath(commonRoute.contact, i18n.language)}
              onClick={() => setIsMenuOpen(false)}
              className="sidebar-link"
            >
              {t("navbar.contact")}
            </NavLink>
          </li>
          {token && (
            <li className="mb-3">
              <NavLink
                to={getLocalizedPath(commonRoute.chat, i18n.language)}
                onClick={() => setIsMenuOpen(false)}
                className="sidebar-link"
              >
                {t("section38.text5")}
              </NavLink>
            </li>
          )}
          {token && (
            <div
              className="notification-bell position-relative cursor-pointer"
              onClick={() => setIsNotificationPanelOpen(true)}
            >
              <IoIosNotifications size={26} className="text-dark" />
              {notificationCount > 0 && (
                <span className="notification-badge-modern">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </div>
          )}
          {!token && (
            <li className="mt-5">
              <button
                className="login-button w-100 rounded-pill py-2"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(getLocalizedPath(commonRoute.logins, i18n.language));
                }}
              >
                {t("section38.text4")}
              </button>
            </li>
          )}
        </ul>
      </div>

      {isMenuOpen && (
        <div
          className="sidebar-backdrop-modern"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

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
    </>
  );
};

export default Navbars;
