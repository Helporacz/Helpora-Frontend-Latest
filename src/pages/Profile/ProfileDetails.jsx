import Button from "components/form/Button";
import TextInput from "components/form/TextInput/TextInput";
import { Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  updateProvider,
  throwSuccess,
  uploadImage,
  throwError,
  getAdminProfile,
  getUserProfile,
} from "store/globalSlice";
import { objectToFormData } from "utils/helpers";
import Loader from "components/layouts/Loader/Loader";

const ProfileDetails = ({
  fetchedData,
  handleSuccess,
  isSuperAdmin,
  newProfileFile,
  resetImage,
  isEditing,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const initialValues = {
    firstName: fetchedData.firstName || "",
    lastName: fetchedData.lastName || "",
    name: fetchedData.name || "",
    email: fetchedData.email || "",
    phoneNumber: fetchedData.phoneNumber || "",
    role: fetchedData.role || "",
    id: fetchedData._id,
  };

  const [imageUploading, setImageUploading] = useState(false);

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

      const formData = objectToFormData(payload);

      const response = await dispatch(
        updateProvider({ id: values.id, payload: formData })
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
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ProfileDetails;
