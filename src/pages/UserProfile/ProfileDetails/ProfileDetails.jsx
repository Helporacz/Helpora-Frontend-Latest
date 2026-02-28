import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  becomeProviderAccount,
  switchAccountRole,
  throwError,
  throwSuccess,
} from "store/globalSlice";
import { getLocalizedPath } from "utils/localizedRoute";
import BecomeProviderModal from "components/account/BecomeProviderModal";

const USER_ROLE = "user";
const PROVIDER_ROLE = "provider";

const normalizeRole = (role = "") => {
  const normalized = String(role || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === USER_ROLE) return USER_ROLE;
  if (
    normalized === PROVIDER_ROLE ||
    normalized === "serviceprovider" ||
    normalized === "service_provider"
  ) {
    return PROVIDER_ROLE;
  }
  return normalized;
};

const normalizeRoles = (roles = [], fallbackRole = USER_ROLE) => {
  const source = Array.isArray(roles) ? roles : [];
  const set = new Set();

  source.forEach((entry) => {
    const normalized = normalizeRole(entry);
    if (normalized === USER_ROLE || normalized === PROVIDER_ROLE) {
      set.add(normalized);
    }
  });

  const normalizedFallback = normalizeRole(fallbackRole);
  if (normalizedFallback === PROVIDER_ROLE) {
    set.add(USER_ROLE);
    set.add(PROVIDER_ROLE);
  } else {
    set.add(USER_ROLE);
  }

  return [USER_ROLE, PROVIDER_ROLE].filter((entry) => set.has(entry));
};

const ProfileDetails = ({ fetchedData, isSuperAdmin }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [showBecomeProviderModal, setShowBecomeProviderModal] = useState(false);

  const {
    name,
    firstName,
    lastName,
    email,
    phoneNumber,
    role,
    _id: id,
  } = fetchedData || {};

  const activeRole = normalizeRole(localStorage.getItem("userRole")) || USER_ROLE;
  const storedRoles = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("userRoles") || "[]");
      return normalizeRoles(parsed, fetchedData?.role || activeRole);
    } catch (error) {
      return normalizeRoles([], fetchedData?.role || activeRole);
    }
  })();
  const availableRoles = normalizeRoles(
    fetchedData?.roles?.length ? fetchedData.roles : storedRoles,
    fetchedData?.role || activeRole
  );
  const canBecomeProvider =
    !isSuperAdmin && !availableRoles.includes(PROVIDER_ROLE);
  const canSwitchToProvider =
    !isSuperAdmin &&
    availableRoles.includes(PROVIDER_ROLE) &&
    activeRole !== PROVIDER_ROLE;
  const canSwitchToUser =
    !isSuperAdmin && availableRoles.includes(USER_ROLE) && activeRole !== USER_ROLE;

  const switchRoleAndRedirect = async (targetRole) => {
    const response = await dispatch(switchAccountRole(targetRole));
    if (response?.status !== 200) {
      dispatch(
        throwError(
          response?.message ||
            t("profileDetails.roleActionFailed", "Unable to update role.")
        )
      );
      return false;
    }

    const successMessage =
      targetRole === PROVIDER_ROLE
        ? t("profileDetails.switchedToProvider", "Switched to provider mode.")
        : t("profileDetails.switchedToUser", "Switched to user mode.");
    dispatch(throwSuccess(successMessage));

    if (targetRole === PROVIDER_ROLE) {
      navigate(getLocalizedPath("/dashboard", i18n.language));
      return true;
    }
    navigate(getLocalizedPath("/user/profile", i18n.language));
    return true;
  };

  const handleSwitchRole = async (targetRole) => {
    if (roleActionLoading) return;
    setRoleActionLoading(true);
    try {
      await switchRoleAndRedirect(targetRole);
    } finally {
      setRoleActionLoading(false);
    }
  };

  const handleBecomeProvider = async () => {
    if (roleActionLoading) return;
    setShowBecomeProviderModal(true);
  };

  const handleBecomeProviderSubmit = async (providerPayload = {}) => {
    if (roleActionLoading) return false;
    setRoleActionLoading(true);
    try {
      const becomeResponse = await dispatch(
        becomeProviderAccount({ termsVersion: "v1", ...providerPayload })
      );
      if (becomeResponse?.status !== 200) {
        dispatch(
          throwError(
            becomeResponse?.message ||
              t("profileDetails.roleActionFailed", "Unable to update role.")
          )
        );
        return false;
      }

      const switched = await switchRoleAndRedirect(PROVIDER_ROLE);
      return switched;
    } finally {
      setRoleActionLoading(false);
    }
  };

  const detailRows = isSuperAdmin
    ? [
        { label: t("profileDetails.firstName"), value: firstName },
        { label: t("profileDetails.lastName"), value: lastName },
        { label: t("profileDetails.emailAddress"), value: email },
        { label: t("profileDetails.phoneNumberOptional"), value: phoneNumber },
        { label: t("profileDetails.role"), value: role, fullWidth: true },
      ]
    : [
        { label: t("profileDetails.name"), value: name },
        { label: t("profileDetails.emailAddress"), value: email },
        { label: t("profileDetails.phoneNumberOptional"), value: phoneNumber },
        { label: t("profileDetails.role"), value: role },
      ];

  return (
    <div className="fadeIn">
      <div className="tw-mb-5 tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3">
        <div>
          <h2 className="tw-mb-1 tw-text-2xl tw-font-semibold tw-text-slate-900">
            {t("profileDetails.title")}
          </h2>
          <p className="tw-m-0 tw-text-sm tw-text-slate-500">
            {t("profile.editProfileDescription")}
          </p>
        </div>
      </div>

      <div className="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
        {detailRows.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={item.fullWidth ? "md:tw-col-span-2" : ""}
          >
            <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
              {item.label}
            </label>
            <div className="tw-flex tw-min-h-[48px] tw-items-center tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-4 tw-text-[15px] tw-font-medium tw-text-slate-800">
              {item?.value ? String(item.value) : "-"}
            </div>
          </div>
        ))}
      </div>

      {!isSuperAdmin && (
        <div className="tw-mt-6 tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-p-4">
          <div className="tw-text-sm tw-font-semibold tw-text-slate-900">
            {t("profileDetails.accountModes", "Account Modes")}
          </div>
          <p className="tw-mb-3 tw-mt-1 tw-text-sm tw-text-slate-600">
            {t("profileDetails.currentMode", {
              defaultValue: "Current mode: {{role}}",
              role: activeRole,
            })}
          </p>
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {canBecomeProvider && (
              <button
                type="button"
                disabled={roleActionLoading}
                onClick={handleBecomeProvider}
                className="tw-rounded-lg tw-bg-emerald-600 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white hover:tw-bg-emerald-700 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
              >
                {roleActionLoading
                  ? t("profileDetails.becomingProvider", "Processing...")
                  : t("profileDetails.becomeProvider", "Become Provider")}
              </button>
            )}
            {canSwitchToProvider && (
              <button
                type="button"
                disabled={roleActionLoading}
                onClick={() => handleSwitchRole(PROVIDER_ROLE)}
                className="tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-slate-800 hover:tw-bg-slate-100 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
              >
                {t("profileDetails.switchToProvider", "Switch to Provider")}
              </button>
            )}
            {canSwitchToUser && (
              <button
                type="button"
                disabled={roleActionLoading}
                onClick={() => handleSwitchRole(USER_ROLE)}
                className="tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-slate-800 hover:tw-bg-slate-100 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
              >
                {t("profileDetails.switchToUser", "Switch to User")}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="tw-mt-6">
        <button
          type="button"
          onClick={() => navigate(`/admins/${id}`)}
          className="tw-inline-flex tw-items-center tw-rounded-xl tw-bg-[#1f3c88] tw-px-6 tw-py-2.5 tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-white tw-transition hover:tw-bg-[#162f6e]"
        >
          {t("common.edit")}
        </button>
      </div>
      <BecomeProviderModal
        open={showBecomeProviderModal}
        loading={roleActionLoading}
        onClose={() => {
          if (!roleActionLoading) {
            setShowBecomeProviderModal(false);
          }
        }}
        onSubmit={handleBecomeProviderSubmit}
        profileData={fetchedData}
      />
    </div>
  );
};

export default ProfileDetails;
