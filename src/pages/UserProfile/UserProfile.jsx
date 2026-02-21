import Loader from "components/layouts/Loader/Loader";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getAdminProfile, getUserProfile } from "store/globalSlice";
import { icons } from "utils/constants";
import ChangePassword from "./ChangePassword";
import ProfileDetails from "./ProfileDetails";
import "./UserProfile.scss";

const UserProfile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [viewType, setViewType] = useState("details");
  const [fetchedData, setFetchedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;

      if (userRole === "superAdmin") {
        response = await dispatch(getAdminProfile());
      } else {
        response = await dispatch(getUserProfile(userId));
      }

      const profileData = response?.data;
      setFetchedData(profileData || {});
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userId, userRole]);

  useEffect(() => {
    if (userId || userRole === "superAdmin") {
      fetchProfile();
    }
  }, [fetchProfile, userId, userRole]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Loader size="md" />
      </div>
    );
  }

  const { profileImage } = fetchedData || {};

  return (
    <div id="user-profile-container" className="container">
      <div className="row">
        <div className="col-md-4">
          <div className="p-3 card-effect mb-3 text-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={{ width: 200, height: 150, borderRadius: 10 }}
              />
            ) : (
              <div
                className="no-logo color-dashboard-primary d-flex justify-content-center align-items-center"
                style={{ width: 200, height: 150, borderRadius: 10 }}
              >
                <i className="bi bi-exclamation color-dashboard-primary text-24-700" />
                {t("profile.noImage")}
              </div>
            )}
          </div>

          <div className="p-3 card-effect mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img src={icons.lock} alt="lock" />
              <span>
                {viewType === "details" ? t("profile.accountPassword") : t("profile.profileDetails")}
              </span>
            </div>
            <div className="text-13-500 color-black-80 mb-2">
              {viewType === "details"
                ? t("profile.changePasswordDescription")
                : t("profile.editProfileDescription")}
            </div>
            <div
              className="color-blue-crayola text-15-600 text-decoration-underline pointer"
              onClick={() =>
                setViewType(viewType === "details" ? "password" : "details")
              }
            >
              {viewType === "details" ? t("profile.changePassword") : t("profile.editProfile")}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="p-3 card-effect">
            {viewType === "details" ? (
              <ProfileDetails
                fetchedData={fetchedData}
                handleSuccess={fetchProfile}
                isSuperAdmin={userRole === "superAdmin"}
              />
            ) : (
              <ChangePassword />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
