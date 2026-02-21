import { ErrorMessage, Field, Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { throwError, userRegister } from "store/globalSlice";
import { commonRoute } from "utils/constants";
import icons from "utils/constants/icons";
import "./RegisterModern.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getLocalizedPath } from "utils/localizedRoute";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();

  const registerSchema = Yup.object().shape({
    name: Yup.string().trim().required(t("section32.text1")),
    email: Yup.string()
      .trim()
      .required(t("section32.text2"))
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        t("section32.text3")
      ),

    password: Yup.string()
      .required(t("section32.text4"))
      .min(6, t("section32.text5"))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        t("section32.text6")
      ),

    confirmPassword: Yup.string()
      .required(t("section32.text7"))
      .oneOf([Yup.ref("password"), null], t("section32.text8")),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);

  const handelSave = async (values) => {
    try {
      setBtnLoading(true);

      const response = await dispatch(userRegister(values));

      const status = response?.status || response?.payload?.status;
      const message =
        response?.message || response?.payload?.message || t("section32.text9");

      if (status === 200) {
        navigate(getLocalizedPath(commonRoute.logins, i18n.language));
      } else {
        dispatch(throwError(message));
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || t("section32.text10");
      dispatch(throwError(errorMessage));
    } finally {
      setBtnLoading(false);
    }
  };
  const initialValues = {
    name: "",
    email: "",
    password: "",
    role: "user",
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
                <span>{t("section21.text7")}</span>
                {/* <hr id="Indicator" /> */}
                <div className="header-underline mx-auto"></div>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={registerSchema}
                onSubmit={handelSave}
              >
                {(props) => {
                  const { values, errors, handleChange, submitForm } = props;
                  const { name, email, password, confirmPassword } = values;

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
                          <p className="m-0" style={{ color: "#0d6b38" }}>
                            {t("section21.text1")}
                          </p>
                          <div className="input-wrapper">
                            <Field
                              type="text"
                              id="name"
                              name="name"
                              placeholder={t("section35.text1")}
                              className="form-control"
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="m-0" style={{ color: "#0d6b38" }}>
                            {t("section21.text2")}
                          </p>
                          <div className="input-wrapper">
                            <Field
                              type="email"
                              id="email"
                              name="email"
                              placeholder={t("section35.text2")}
                              className="form-control"
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="m-0" style={{ color: "#0d6b38" }}>
                            {t("section21.text3")}
                          </p>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              id="password"
                              name="password"
                              placeholder={t("section35.text3")}
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
                          <p className="m-0" style={{ color: "#0d6b38" }}>
                            {t("section21.text4")}
                          </p>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              placeholder={t("section35.text4")}
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

                      <div className="link-text">
                        <span>
                          {t("section21.text5")}{" "}
                          <span
                            style={{ cursor: "pointer", color: "green" }}
                            onClick={() =>
                              navigate(
                                getLocalizedPath(
                                  commonRoute.logins,
                                  i18n.language
                                )
                              )
                            }
                          >
                            {t("section21.text6")}
                          </span>
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="btn12 loginsbtn"
                        disabled={btnLoading}
                      >
                        {btnLoading ? "Signing up..." : "SIGN UP"}
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

export default RegisterPage;
