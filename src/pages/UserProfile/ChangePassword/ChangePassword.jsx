import Button from "components/form/Button";
import PasswordInput from "components/form/PasswordInput";
import { Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { handlePassword, throwError, throwSuccess } from "store/globalSlice";
import * as Yup from "yup";

const ChangePassword = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSave = async (values) => {
    setBtnLoading(true);
    const payload = values;

    const response = await dispatch(handlePassword(payload));
    if (response?.status === 200) {
      dispatch(throwSuccess(t("messages.passwordChangedSuccessfully")));
      navigate("/login");
    } else {
      const errorMsg = response?.message || t("messages.somethingWentWrong");
      dispatch(throwError(errorMsg));
    }
    setBtnLoading(false);
  };

  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old Password is required."),
    newPassword: Yup.string()
      .required("New Password is required.")
      .matches(/^\S*$/, "Whitespace is not allowed.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/,
        "Password must be 6–16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      ),
    confirmPassword: Yup.string()
      .required("Confirm Password is required.")
      .matches(/^\S*$/, "Whitespace is not allowed.")
      .oneOf([Yup.ref("newPassword"), null], "Password not matched."),
  });
  return (
    <div className="fadeIn">
      <div className="text-20-700 color-dashboard-primary text-center">
        Change Password
      </div>
      <div className="d-flex justify-content-center cmb-24">
        <div className="text-center text-15-500 color-black-80 w-50">
          Kindly enter your current password and choose a new password
        </div>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSave}
      >
        {(props) => {
          const { values, errors, handleChange, submitForm } = props;
          const { oldPassword, newPassword, confirmPassword } = values;
          return (
            <div>
              <div className="cmb-24">
                <PasswordInput
                  label="Current Password"
                  placeholder="Enter current password"
                  id="oldPassword"
                  value={oldPassword}
                  error={errors.oldPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="cmb-24">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  id="newPassword"
                  value={newPassword}
                  error={errors.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="cmb-24">
                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Enter confirm password"
                  id="confirmPassword"
                  value={confirmPassword}
                  error={errors.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Button
                  btnText="CHANGE PASSWORD"
                  btnStyle="PD"
                  onClick={submitForm}
                  btnLoading={btnLoading}
                />
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};
export default ChangePassword;
