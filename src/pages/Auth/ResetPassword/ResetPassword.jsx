import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiLock, FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { resetPassword, throwError, throwSuccess } from "store/globalSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLocalizedPath } from "utils/localizedRoute";
import { useTranslation } from "react-i18next";
import { commonRoute } from "utils/constants";

const Resetpassword = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

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
    <div className="register-wrapper">
      <div className="background-animation">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="register-card">
              <div className="register-header">
                <div className="logo-section">
                  <div className="logo-icon">
                    <HiSparkles />
                  </div>
                  <h1 className="brand-name">{t("section19.text1")}</h1>
                </div>

                <div className="welcome-text">
                  <h2>{t("section19.text12")}</h2>
                </div>
              </div>

              <div className="register-form-section">
                <Formik
                  initialValues={initialValues}
                  validationSchema={resetSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, values, errors }) => {
                    return (
                      <Form>
                        <div className="form-group">
                          <label htmlFor="password" className="form-label">
                            <FiLock className="label-icon" />
                            {t("section19.text5")}
                          </label>

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

                        <div className="form-group">
                          <label
                            htmlFor="confirmPassword"
                            className="form-label"
                          >
                            <FiLock className="label-icon" />
                            {t("section19.text5")}
                          </label>

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

                        <button
                          type="submit"
                          className={`btn1 btn-submit ${
                            isSubmitting ? "loading" : ""
                          }`}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t("section19.text8")}
                            </>
                          ) : (
                            <>
                              {t("section19.text13")}
                              <FiArrowRight className="ms-2" />
                            </>
                          )}
                        </button>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resetpassword;
