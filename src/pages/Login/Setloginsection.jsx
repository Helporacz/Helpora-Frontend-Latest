import { ErrorMessage, Field, Formik } from "formik";
import icons from "../../utils/constants/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { throwError, throwSuccess, userLogin } from "store/globalSlice";
import { commonRoute } from "utils/constants";
import * as Yup from "yup";
import "./Setlogin.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getLocalizedPath } from "utils/localizedRoute";
import { useTranslation } from "react-i18next";

const Setloginsection = () => {
  const [loginRole, setLoginRole] = useState('user');
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);

  const handelSave = async (values) => {
      setBtnLoading(true);
      try {
        const timeoutMs = 15000;

        const response = await Promise.race([
          dispatch(userLogin(values, loginRole)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Login timeout")), timeoutMs)
          ),
        ]);

        if (response?.status === 200) {
          navigate(getLocalizedPath(commonRoute.home, i18n.language));
          dispatch(
            throwSuccess(
              `${loginRole === "provider" ? "Provider" : "User"} Login Successfully`
            )
          );
        } else {
          dispatch(throwError(response?.message || "Login failed"));
        }
      } catch (err) {
        dispatch(throwError(err?.message || "Login failed"));
      } finally {
        setBtnLoading(false);
      }
    };

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("section31.text1"))
      .required(t("section31.text2")),
    password: Yup.string()
      .min(6, t("section31.text3"))
      .required(t("section31.text4")),
  });
  return (
    <div className="container" style={{ height: "100vh" }}>
      <div style={{ paddingTop: "20px" }}>
        <a href="/">
          <img src={icons.logo} width="180px" height="50px" alt="Logo" />
        </a>
      </div>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "90vh" }}
      >
        <div className="col-7 d-flex justify-content-center login-image-col">
          <div className="login-image-wrapper">
            <DotLottieReact
              src="https://lottie.host/25a709ab-e73b-4d2f-83c1-976b10309aa4/LqaUUKCrWt.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        <div className="col-5 login-form-col pt-5">
          <div className="login-modern">
            <div className="form-container-login">
              <div className="form-btn" style={{ marginBottom: "0px" }}>
                <span>{t("section17.text1")}</span>
                {/* <hr id="Indicator" /> */}
                <div className="header-underline mx-auto"></div>
                
              </div>

              <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handelSave}
                validateOnChange={false}
              >
                {(props) => {
                  const { submitForm } = props;
                  return (
  
                  <>
<div className="login-role-tabs">
                    <button
                      type="button"
                      className={loginRole === "user" ? "tab-btn active" : "tab-btn"}
                      onClick={() => setLoginRole("user")}
                    >
                      User Login
                    </button>
                    <button
                      type="button"
                      className={loginRole === "provider" ? "tab-btn active" : "tab-btn"}
                      onClick={() => setLoginRole("provider")}
                    >
                      Provider Login
                    </button>
                  </div>
                  
  
                  <form
                      className="login-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitForm();
                      }}
                    >
                      <div className="d-flex flex-column gap-3 mb-3">
                        <div>
                          <p className="m-0" style={{ color:"#0d6b38" }}>{t("section17.text2")}</p>
                          <div className="input-wrapper">
                            <Field
                              type="email"
                              id="email"
                              name="email"
                              placeholder={t("section37.text1")}
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
                          <p className="m-0" style={{ color:"#0d6b38" }}>{t("section17.text3")}</p>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              id="password"
                              name="password"
                              placeholder={t("section37.text2")}
                              className="form-control"
                            />
                            <ErrorMessage
                              name="password"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="link-text">
                          <span>
                            {t("section17.text4")}{" "}
                            <span
                              style={{ cursor: "pointer", color: "green" }}
                              onClick={() =>
                                navigate(
                                  getLocalizedPath(
                                    loginRole === "provider"
                                      ? commonRoute.signUp
                                      : commonRoute.register,
                                    i18n.language
                                  )
                                )
                              }
                            >
                              {t("section17.text5")}
                            </span>
                            <p
                              style={{ cursor: "pointer", color: "green" }}
                              onClick={() =>
                                navigate(
                                  getLocalizedPath(
                                    commonRoute.forgot,
                                    i18n.language
                                  )
                                )
                              }
                            >
                              {" "}{t("section17.text6")}
                            </p>
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn12 loginsbtn"
                        disabled={btnLoading}
                      >
                        {btnLoading ? "Signing..." : "SIGN IN"}
                      </button>
                    </form>
</>

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

export default Setloginsection;
