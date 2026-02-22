import Loader from "components/layouts/Loader/Loader";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getAdminProfile, getUserProfile } from "store/globalSlice";
import ChangePassword from "./ChangePassword";
import ProfileDetails from "./ProfileDetails";

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
      <div className="tw-flex tw-min-h-[55vh] tw-items-center tw-justify-center">
        <Loader size="md" />
      </div>
    );
  }

  const { profileImage, name, firstName, lastName, email, role } = fetchedData || {};
  const displayName =
    name || [firstName, lastName].filter(Boolean).join(" ").trim() || "-";

  return (
    <div className="tw-min-h-[calc(100vh-120px)] tw-bg-slate-100 tw-p-3 md:tw-p-6">
      <div className="tw-grid tw-grid-cols-1 tw-gap-5 xl:tw-grid-cols-[340px_minmax(0,1fr)]">
        <aside className="tw-space-y-5">
          <section className="tw-overflow-hidden tw-rounded-2xl tw-bg-white tw-shadow-sm tw-ring-1 tw-ring-slate-200">
            <div className="tw-p-5">
              <div className="tw-mx-auto tw-h-52 tw-w-full tw-max-w-[260px] tw-overflow-hidden tw-rounded-xl tw-bg-slate-100 tw-ring-1 tw-ring-slate-200">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="tw-h-full tw-w-full tw-object-cover"
                  />
                ) : (
                  <div className="tw-flex tw-h-full tw-w-full tw-flex-col tw-items-center tw-justify-center tw-gap-2 tw-bg-slate-200 tw-text-slate-500">
                    <i className="fa-regular fa-user tw-text-3xl" />
                    <span className="tw-text-sm tw-font-medium">{t("profile.noImage")}</span>
                  </div>
                )}
              </div>
              <div className="tw-mt-4 tw-text-center">
                <p className="tw-mb-1 tw-text-lg tw-font-semibold tw-text-slate-900">{displayName}</p>
                <p className="tw-mb-0 tw-text-sm tw-text-slate-500">{email || "-"}</p>
                <span className="tw-mt-3 tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-700 tw-ring-1 tw-ring-slate-200">
                  {role || "-"}
                </span>
              </div>
            </div>
          </section>

          <section className="tw-rounded-2xl tw-bg-white tw-p-5 tw-shadow-sm tw-ring-1 tw-ring-slate-200">
            <div className="tw-flex tw-items-start tw-gap-3">
              <div className="tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-bg-slate-900 tw-text-white">
                <i className="fa-solid fa-lock tw-text-sm" />
              </div>
              <div className="tw-flex-1">
                <h3 className="tw-mb-1 tw-text-base tw-font-semibold tw-text-slate-900">
                  {viewType === "details"
                    ? t("profile.accountPassword")
                    : t("profile.profileDetails")}
                </h3>
                <p className="tw-mb-4 tw-text-sm tw-text-slate-600">
                  {viewType === "details"
                    ? t("profile.changePasswordDescription")
                    : t("profile.editProfileDescription")}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setViewType(viewType === "details" ? "password" : "details")
                  }
                  className="tw-inline-flex tw-items-center tw-rounded-xl tw-bg-[#1f3c88] tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-[#162f6e]"
                >
                  {viewType === "details"
                    ? t("profile.changePassword")
                    : t("profile.editProfile")}
                </button>
              </div>
            </div>
          </section>
        </aside>

        <section className="tw-rounded-2xl tw-bg-white tw-p-4 tw-shadow-sm tw-ring-1 tw-ring-slate-200 md:tw-p-6">
          <div className="tw-min-h-[320px]">
            {viewType === "details" ? (
              <ProfileDetails
                fetchedData={fetchedData}
                isSuperAdmin={userRole === "superAdmin"}
              />
            ) : (
              <ChangePassword />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
