import Button from "components/form/Button";
import TextInput from "components/form/TextInput";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "components/layouts/Loader/Loader";
import { Formik } from "formik";
import { isEqual } from "lodash";
import { useDispatch } from "react-redux";
import {
  getAdminProfile,
  getUserProfile,
  throwError,
  throwSuccess,
  updateAdminProfile,
  updateProvider,
  uploadImage,
} from "store/globalSlice";
import { objectToFormData } from "utils/helpers";
import * as Yup from "yup";
import AccessibilitySettings from "./AccessibilitySettings";
import "./AddAdmin.scss";

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(50, "First Name cannot exceed 50 characters")
    .when("role", {
      is: "superAdmin",
      then: (schema) => schema.required("First Name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  lastName: Yup.string()
    .max(50, "Last Name cannot exceed 50 characters")
    .when("role", {
      is: "superAdmin",
      then: (schema) => schema.required("Last Name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  name: Yup.string()
    .max(100, "Name cannot exceed 100 characters")
    .when("role", {
      is: "superAdmin",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Name is required"),
    }),
  email: Yup.string()
    .email("Please enter valid email")
    .required("Email is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
      "Please enter a valid email"
    ),
  phoneNumber: Yup.string()
    .matches(
      /^\d{10}$/,
      "Phone number must be exactly 10 digits and contain only numbers"
    )
    .nullable(),
  role: Yup.string().required("Role is required"),
});
const AddAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formRef = useRef();
  const params = useParams();
  const [showAS, setShowAS] = useState(false);
  const isEdit = params?.type !== "add-admin";

  const [isLoading, setIsLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [imgData, setImgData] = useState(null);
  const [fetchedData, setFetchedData] = useState({});
  const [newProfileFile, setNewProfileFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const {
    profileImage,
    firstName,
    name,
    lastName,
    email,
    phoneNumber,
    role,
    _id: id,
  } = fetchedData || {};

  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");

  const fetchProfile = useCallback(async () => {
    let response = "";
    if (userRole === "superAdmin") {
      response = await dispatch(getAdminProfile());
    } else {
      if (!userId) return;
      response = await dispatch(getUserProfile(userId));
    }
    const profileData = response?.data;
    setFetchedData(profileData);
    setImgData(profileData?.profileImage || null);
    setIsLoading(false);
  }, [dispatch, userRole, userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const initialValues = {
    profileImage: profileImage || "",
    firstName: firstName || "",
    name: name || "",
    lastName: lastName || "",
    email: email || "",
    phoneNumber: phoneNumber || "",
    role: role || "",
    Id: id,
    oldEmail: email || "",
  };

  const handleSave = async (values) => {
    const isNewImageSelected = isEdit && newProfileFile;
    let imageUrlToSave = values.profileImage;

    setBtnLoading(true);

    try {
      if (isNewImageSelected) {
        const formData = new FormData();
        formData.append("image", newProfileFile);

        const uploadRes = await dispatch(uploadImage(formData));

        if (uploadRes?.status === 200) {
          imageUrlToSave = uploadRes.data.secure_url;
        } else {
          dispatch(throwError("Profile image upload failed."));
          setBtnLoading(false);
          return;
        }
      }

      const payload = {
        ...values,
        profileImage: imageUrlToSave,
      };
      const formData = objectToFormData(payload);

      let response = "";
      if (userRole === "superAdmin") {
        response = await dispatch(updateAdminProfile(formData));
      } else {
        response = await dispatch(
          updateProvider({ id: userId, payload: formData })
        );
      }

      if (response?.status === 200) {
        dispatch(throwSuccess("Profile Updated Successfully"));
        setNewProfileFile(null);

        // Refresh Redux state so Header updates immediately
        if (userRole === "superAdmin") {
          await dispatch(getAdminProfile());
        } else {
          await dispatch(getUserProfile(userId));
        }

        fetchProfile();
      } else {
        dispatch(throwError(response?.message));
      }
    } catch (error) {
      console.error("Save error:", error);
      dispatch(throwError("An unexpected error occurred during save."));
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div id="add-admin-container">
      {showAS && (
        <AccessibilitySettings
          onHide={() => {
            setShowAS(false);
          }}
        />
      )}
      <div className="container card-effect block-content d-flex justify-content-center">
        <div className="text-20-700 color-dashboard-primary cmb-40">
          {isEdit ? "Edit Profile" : "Add Profile"}
        </div>
      </div>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <Loader size="md" />
        </div>
      ) : (
        <Formik
          enableReinitialize
          innerRef={formRef}
          initialValues={initialValues}
          onSubmit={handleSave}
          validationSchema={validationSchema}
        >
          {(props) => {
            const {
              values,
              handleChange,
              submitForm,
              handleReset,
              touched,
              errors,
            } = props;
            const { firstName, lastName, name, email, phoneNumber, role } =
              values;

            return (
              <form className="form-block">
                <div className="row">
                  <div className="card-effect cmb-44 change-profile-container w-100 position-relative">
                    <div className="change-profile-block bg-blue-5">
                      {imageUploading ? (
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{ width: "200px", height: "150px" }}
                        >
                          <Loader size="sm" /> 
                        </div>
                      ) : imgData ? (
                        <img
                          src={imgData}
                          alt="Profile"
                          style={{
                            width: "200px",
                            height: "150px",
                            borderRadius: "10px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="no-logo color-dashboard-primary d-flex justify-content-center align-items-center"
                          style={{
                            width: "200px",
                            height: "150px",
                            borderRadius: "10px",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>

                    {isEdit ? (
                      <div className="product-upload">
                        <div className="cmt-16 text-block">Change Photo</div>
                        <input
                          type="file"
                          className="fileType pointer"
                          onChange={(e) => {
                            const file = e?.target?.files[0];
                            if (!file) return;

                            const extension = file?.type;

                            if (
                              ![
                                "image/png",
                                "image/jpg",
                                "image/jpeg",
                              ].includes(extension)
                            ) {
                              dispatch(
                                throwError(
                                  "Invalid file type. Only PNG, JPG, JPEG are allowed."
                                )
                              );
                              e.target.value = null;
                              return;
                            }

                            setImageUploading(true);
                            setNewProfileFile(file);

                            const reader = new FileReader();
                            reader.onload = () => {
                              setImgData(reader.result);
                              setImageUploading(false);
                            };
                            reader.onerror = () => {
                              setImageUploading(false);
                              dispatch(
                                throwError("Failed to read image file.")
                              );
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="cmt-16 text-13-500">
                        Upload User photo
                      </div>
                    )}
                  </div>
                  {userRole === "superAdmin" ? (
                    <div className="d-flex gap-2">
                      <div className="col-md-6 cmb-24 ">
                        <TextInput
                          label="First Name"
                          id="firstName"
                          value={firstName}
                          onChange={handleChange}
                          error={touched.firstName && errors.firstName}
                        />
                      </div>
                      <div className="col-md-6 cmb-24">
                        <TextInput
                          label="Last Name"
                          id="lastName"
                          value={lastName}
                          onChange={handleChange}
                          className="mt-3"
                          error={touched.lastName && errors.lastName}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={
                        userRole === "superAdmin"
                          ? "col-md-6 cmb-24"
                          : "col-md-12   cmb-24"
                      }
                    >
                      <TextInput
                        label="Enter Name"
                        id="name"
                        value={name}
                        onChange={handleChange}
                        error={touched.name && errors.name}
                      />
                    </div>
                  )}
                  <div
                    className={userRole === "superAdmin" ? "d-flex gap-2" : ""}
                  >
                    <div
                      className={
                        userRole === "superAdmin"
                          ? "col-md-6 cmb-24"
                          : "col-md-12 cmb-24"
                      }
                    >
                      <TextInput
                        label="Email Address"
                        id="email"
                        value={email}
                        onChange={handleChange}
                        error={touched.email && errors.email}
                      />
                    </div>
                    <div
                      className={
                        userRole === "superAdmin"
                          ? "col-md-6 cmb-24"
                          : "col-md-12 cmb-24"
                      }
                    >
                      <TextInput
                        label="Phone Number (Optional)"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={handleChange}
                        error={touched.phoneNumber && errors.phoneNumber}
                      />
                    </div>
                  </div>
                  <div
                    className={userRole === "superAdmin" ? "d-flex gap-2" : ""}
                  >
                    <div className="cmb-24 col-md-12">
                      <TextInput
                        label="Role"
                        id="role"
                        value={role}
                        onChange={handleChange}
                        disabled
                        error={touched.role && errors.role}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <div className="col-md-6 " style={{ padding: 0 }}>
                      <Button
                        btnText="CANCEL"
                        btnStyle="BO"
                        onClick={() => {
                          handleReset();
                          setNewProfileFile(null);
                          setImgData(fetchedData?.profileImage || null);
                          navigate(-1);
                        }}
                      />
                    </div>
                    <div className="col-md-6 " style={{ padding: 0 }}>
                      <Button
                        btnText={isEdit ? "SAVE CHANGES" : "ADD USER"}
                        btnStyle={isEdit ? "PD" : "BDD"}
                        onClick={submitForm}
                        btnLoading={btnLoading}
                        disabled={
                          isEqual(values, initialValues) && !newProfileFile
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            );
          }}
        </Formik>
      )}
    </div>
  );
};
export default AddAdmin;
