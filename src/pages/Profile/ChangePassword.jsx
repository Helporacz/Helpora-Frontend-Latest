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
    oldPassword: Yup.string().required(t("changePassword.validation.oldPassward")),
    newPassword: Yup.string()
      .required(t("changePassword.validation.newPassword1"))
      .matches(/^\S*$/, t("changePassword.validation.newPassword2"))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/,
        t("changePassword.validation.newPassword3")
      ),
    confirmPassword: Yup.string()
      .required(t("changePassword.validation.confirmPassword1"))
      .matches(/^\S*$/, t("changePassword.validation.confirmPassword2"))
      .oneOf([Yup.ref("newPassword"), null], t("changePassword.validation.confirmPassword3")),
  });
  return (
    <div className="fadeIn">
      <div className="text-20-700 color-dashboard-primary text-center">
        {t("changePassword.heading")}
      </div>
      <div className="d-flex justify-content-center cmb-24">
        <div className="text-center text-15-500 color-black-80 w-50">
          {t("changePassword.text")}
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
                  label={t("changePassword.currentPassword")}
                  placeholder={t("changePassword.currentPasswordPlaceHolder")}
                  id="oldPassword"
                  value={oldPassword}
                  error={errors.oldPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="cmb-24">
                <PasswordInput
                  label={t("changePassword.newPassword")}
                  placeholder={t("changePassword.newPasswordPlaceHolder")}
                  id="newPassword"
                  value={newPassword}
                  error={errors.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="cmb-24">
                <PasswordInput
                  label={t("changePassword.confirmPassword")}
                  placeholder={t("changePassword.confirmPasswordPlaceHolder")}
                  id="confirmPassword"
                  value={confirmPassword}
                  error={errors.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Button
                  btnText={t("changePassword.button")}
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
