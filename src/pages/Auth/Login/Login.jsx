import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import "./Login.scss";
import { throwError, userLogin } from "store/globalSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getLocalizedPath } from "utils/localizedRoute";
import { useTranslation } from "react-i18next";
import { commonRoute } from "utils/constants";

const Login = () => {
  const { t, i18n } = useTranslation();

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("section29.text1"))
      .required(t("section29.text2")),
    password: Yup.string()
      .min(6, t("section29.text3"))
      .required(t("section29.text4")),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await dispatch(userLogin(values));

      if (response?.status === 200) {
        const activeRole = String(
          response?.user?.role || localStorage.getItem("userRole") || ""
        )
          .trim()
          .toLowerCase();
        const isProvider = activeRole === "provider";

        if (isProvider) {
          const requireProviderSubscription =
            typeof response?.requireProviderSubscription === "boolean"
              ? response.requireProviderSubscription
              : localStorage.getItem("requireProviderSubscription") !== "false";
          const providerSubscriptionActive =
            typeof response?.subscriptionActive === "boolean"
              ? response.subscriptionActive
              : localStorage.getItem("subscriptionActive") === "true";
          const canAccessProviderDashboard = requireProviderSubscription
            ? providerSubscriptionActive
            : true;

          if (!canAccessProviderDashboard) {
            navigate(getLocalizedPath(commonRoute.pricing, i18n.language));
            return;
          }

          navigate(getLocalizedPath(commonRoute.dashboard, i18n.language));
          return;
        }

        navigate(getLocalizedPath(commonRoute.home, i18n.language));
      } else if (
        response?.status === 403 &&
        response?.message === "Account is suspended"
      ) {
        // Handle suspended account specifically
        dispatch(
          throwError("Your account has been suspended. Please contact support.")
        );
      } else {
        dispatch(throwError(response?.message || t("section29.text6")));
      }
    } catch (error) {
      dispatch(throwError(t("section29.text7")));
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    email: "",
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
                  <h2>{t("section19.text2")}</h2>
                  <p>{t("section19.text3")}</p>
                </div>
              </div>

              <div className="register-form-section">
                <Formik
                  initialValues={initialValues}
                  validationSchema={loginSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, values, errors }) => {
                    return (
                      <Form>
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            <FiMail className="label-icon" />
                            {t("section19.text4")}
                          </label>

                          <div className="input-wrapper">
                            <Field
                              type="email"
                              id="email"
                              name="email"
                              placeholder="your.email@example.com"
                              className="form-control"
                            />

                            <ErrorMessage
                              name="email"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>

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
                              placeholder="Enter your password"
                              className="form-control"
                            />

                            <ErrorMessage
                              name="password"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>

                        <div className="sign-in-link d-flex justify-content-between">
                          <div>
                            <span>{t("section19.text6")}</span>
                            <span
                              className="link-primary"
                              onClick={() =>
                                navigate(
                                  getLocalizedPath("/sign-up", i18n.language)
                                )
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <FiLogIn className="me-1" />{" "}
                              {t("section19.text7")}
                            </span>
                          </div>

                          <span
                            className="link-primary"
                            onClick={() =>
                              navigate(
                                getLocalizedPath(
                                  "/forgotpasswords",
                                  i18n.language
                                )
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {t("section19.text11")}
                          </span>
                        </div>

                        <button
                          type="submit"
                          className={`btn1 btn-submit ${
                            isSubmitting ? "loading" : ""
                          }`}
                          disabled={
                            isSubmitting ||
                            values.email.length === 0 ||
                            values.password.length === 0
                          }
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t("section19.text8")}
                            </>
                          ) : (
                            <>{t("section19.text9")}</>
                          )}
                        </button>
                      </Form>
                    );
                  }}
                </Formik>
              </div>

              <div className="register-footer">
                <p>{t("section19.text10")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
