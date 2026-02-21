import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { forgetPassword, throwError, throwSuccess } from "store/globalSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

const Forgotpassword = () => {
  const { t, i18n } = useTranslation();

  const ForgotpasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("section29.text1"))
      .required(t("section29.text2")),
  });

  const dispatch = useDispatch();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await dispatch(forgetPassword(values));
      if (response?.status === 200) {
        dispatch(throwSuccess(t("section29.text8")));
      } else {
        dispatch(throwError(t("section29.text6")));
      }
    } catch (error) {
      dispatch(throwError(t("section29.text7")));
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    email: "",
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
                  validationSchema={ForgotpasswordSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, values }) => {
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

                        <button
                          type="submit"
                          className={`btn1 btn-submit ${
                            isSubmitting ? "loading" : ""
                          }`}
                          disabled={isSubmitting || values.email.length === 0}
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

export default Forgotpassword;
