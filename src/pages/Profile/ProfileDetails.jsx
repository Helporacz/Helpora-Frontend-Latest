import Button from "components/form/Button";
import TextInput from "components/form/TextInput/TextInput";
import { Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  becomeProviderAccount,
  switchAccountRole,
  updateProvider,
  throwSuccess,
  uploadImage,
  throwError,
  getAdminProfile,
  getUserProfile,
} from "store/globalSlice";
import Loader from "components/layouts/Loader/Loader";
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

const ProfileDetails = ({
  fetchedData,
  handleSuccess,
  isSuperAdmin,
  newProfileFile,
  resetImage,
 isEditing,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const activeRole = normalizeRole(localStorage.getItem("userRole")) || USER_ROLE;
  const storedRoles = (() => {
    try {
      const parsedRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
      return normalizeRoles(parsedRoles, fetchedData?.role || activeRole);
    } catch (error) {
      return normalizeRoles([], fetchedData?.role || activeRole);
    }
  })();
  const availableRoles = normalizeRoles(
    fetchedData?.roles?.length ? fetchedData.roles : storedRoles,
    fetchedData?.role || activeRole
  );

  const initialValues = {
    firstName: fetchedData.firstName || "",
    lastName: fetchedData.lastName || "",
    name: fetchedData.name || "",
    email: fetchedData.email || "",
    phoneNumber: fetchedData.phoneNumber || "",
    role: activeRole || fetchedData.role || "",
    id: fetchedData._id,
  };

  const [imageUploading, setImageUploading] = useState(false);
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [showBecomeProviderModal, setShowBecomeProviderModal] = useState(false);

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

  const handleSave = async (values) => {
    try {
      let imageUrlToSave = fetchedData?.profileImage;
      const isNewImageSelected = isEditing && newProfileFile;

      if (isNewImageSelected) {
        setImageUploading(true);
        const imgForm = new FormData();
        imgForm.append("image", newProfileFile);

        const uploadRes = await dispatch(uploadImage(imgForm));

        if (uploadRes?.status === 200) {
          imageUrlToSave = uploadRes.data.secure_url;
        } else {
          dispatch(throwError(t("messages.profileImageUploadFailed")));
          setImageUploading(false);
          return;
        }
        setImageUploading(false);
      }

      const payload = {
        ...values,
        profileImage: imageUrlToSave,
      };
      const response = await dispatch(
        updateProvider({ id: values.id, payload })
      );

      if (response?.status === 200) {
        dispatch(throwSuccess(t("messages.profileUpdatedSuccessfully")));
        resetImage();
        
        if (userRole === "superAdmin") {
          await dispatch(getAdminProfile());
        } else {
          await dispatch(getUserProfile(userId));
        }
        
        handleSuccess();
      } else {
        const errorMsg = response?.message || t("messages.updateFailed");
        dispatch(throwError(errorMsg));
      }
    } catch (error) {
      console.error("Save error:", error);
      dispatch(throwError(t("messages.unexpectedError")));
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="fadeIn">
      <div className="text-20-700 color-dashboard-primary text-center mb-5">
        {t("profileDetails.title")}
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleSave}
      >
        {(props) => {
          const { values, handleChange, submitForm, resetForm } = props;

          return (
            <form className="row">
              {isSuperAdmin ? (
                <>
                  <div className="col-md-6 cmb-30">
                    <TextInput
                      label={t("profileDetails.firstName")}
                      id="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="col-md-6 cmb-30">
                    <TextInput
                      label={t("profileDetails.lastName")}
                      id="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </>
              ) : (
                <div className="col-md-6 cmb-30">
                  <TextInput
                    label={t("profileDetails.name")}
                    id="name"
                    value={values.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              )}

              <div className="col-md-6 cmb-30">
                <TextInput
                  label={t("profileDetails.emailAddress")}
                  id="email"
                  value={values.email}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div className="col-md-6 cmb-30">
                <TextInput
                  label={t("profileDetails.phoneNumber")}
                  id="phoneNumber"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="col-md-6 cmb-30">
                <TextInput
                  label={t("profileDetails.role")}
                  id="role"
                  value={values.role}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div className="d-flex gap-3 mt-3">
                <Button
                  btnText={t("common.saveChanges").toUpperCase()}
                  btnStyle="PD"
                  onClick={submitForm}
                  btnLoading={imageUploading}
                  disabled={imageUploading}
                />

                <Button
                  btnText={t("common.cancel").toUpperCase()}
                  btnStyle="BD"
                  onClick={() => {
                    resetForm();
                    resetImage();
                  }}
                  disabled={imageUploading}
                />
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
                        className="tw-rounded-lg tw-bg-emerald-600 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-emerald-700 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
                        disabled={roleActionLoading}
                        onClick={handleBecomeProvider}
                      >
                        {roleActionLoading
                          ? t("profileDetails.becomingProvider", "Processing...")
                          : t(
                              "profileDetails.becomeProvider",
                              "Become Provider"
                            )}
                      </button>
                    )}

                    {canSwitchToProvider && (
                      <button
                        type="button"
                        className="tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-slate-800 hover:tw-bg-slate-100 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
                        disabled={roleActionLoading}
                        onClick={() => handleSwitchRole(PROVIDER_ROLE)}
                      >
                        {t("profileDetails.switchToProvider", "Switch to Provider")}
                      </button>
                    )}

                    {canSwitchToUser && (
                      <button
                        type="button"
                        className="tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-slate-800 hover:tw-bg-slate-100 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
                        disabled={roleActionLoading}
                        onClick={() => handleSwitchRole(USER_ROLE)}
                      >
                        {t("profileDetails.switchToUser", "Switch to User")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          );
        }}
      </Formik>
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
