import { ErrorMessage, Field, Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { resetPassword, throwError, throwSuccess } from "store/globalSlice";
import { commonRoute } from "utils/constants";
import icons from "utils/constants/icons";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getLocalizedPath } from "utils/localizedRoute";
import { useTranslation } from "react-i18next";

const Forgots = () => {
  const { t, i18n } = useTranslation();

  const resetSchema = Yup.object({
    password: Yup.string()
      .min(6, t("ResetPassword.minLength"))
      .required(t("ResetPassword.passwordRequired")),

    confirmPassword: Yup.string()
      .required(t("ResetPassword.confirmRequired"))
      .oneOf([Yup.ref("password"), null], t("ResetPassword.errormessage1")),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [btnLoading, setBtnLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await dispatch(
        resetPassword({
          token,
          password: values.password,
        })
      );

      if (response?.status === 200) {
        dispatch(throwSuccess("Password reset successful"));
        navigate(getLocalizedPath(commonRoute.login, i18n.language));
      } else {
        dispatch(throwError("Invalid or expired token"));
      }
    } catch {
      dispatch(throwError("Something went wrong"));
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    confirmPassword: "",
    password: "",
  };

  return (
    <div className="container" style={{ height: "100vh" }}>
      <div style={{ paddingTop: "20px" }}>
        <a href="/">
          <img src={icons.logo} width="180px" alt="Logo" />
        </a>
      </div>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "90vh" }}
      >
        <div className="col-7 d-flex justify-content-center register-image-col">
          <div className="register-image-wrapper">
            <DotLottieReact
              src="https://lottie.host/25a709ab-e73b-4d2f-83c1-976b10309aa4/LqaUUKCrWt.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        <div className="col-5 register-form-col pt-5">
          <div className="register-modern">
            <div className="form-container-register">
              <div className="form-btn" style={{ marginBottom: "0px" }}>
                <span>{t("ResetPassword.heading")}</span>
                <div className="header-underline mx-auto"></div>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={resetSchema}
                onSubmit={handleSubmit}
              >
                {(props) => {
                  const { submitForm } = props;

                  return (
                    <form
                      className="register-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitForm();
                      }}
                      style={{ marginTop: "0px" }}
                    >
                      <div className="d-flex flex-column gap-3 mb-3">
                        <div>
                          <p className="m-0" style={{ color:"#0d6b38" }}>{t("ResetPassword.newPassword")}</p>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              id="password"
                              name="password"
                              placeholder={t("ResetPassword.label1")}
                              className="form-control"
                            />
                            <ErrorMessage
                              name="password"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="m-0" style={{ color:"#0d6b38" }}>{t("ResetPassword.confirmPassword")}</p>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              placeholder={t("ResetPassword.label2")}
                              className="form-control"
                            />
                            <ErrorMessage
                              name="confirmPassword"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn12 loginsbtn"
                        disabled={btnLoading}
                      >
                        {btnLoading ? t("ResetPassword.button2") : t("ResetPassword.button")}
                      </button>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgots;
