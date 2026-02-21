import { Formik } from "formik";
import icons from "../../utils/constants/icons";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { throwError, userRegister } from "store/globalSlice";
import { commonRoute } from "utils/constants";
import * as Yup from "yup";
import "./Forgot.css";
import { useTranslation } from "react-i18next";

const ForgetSection = () => {
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);

  const handelSave = async (values) => {
    setBtnLoading(true);
    const response = await dispatch(userRegister(values));
    if (response?.status === 200) {
      navigate(commonRoute.login);
    } else {
      dispatch(throwError(response.message));
    }
    setBtnLoading(false);
  };

  const initialValues = {
    name: "",
    email: "",
    password: "",
    conformPassword: "",
    role: "user",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t("section30.text1")),
    email: Yup.string()
      .email(t("section30.text2"))
      .required(t("section30.text3")),
    password: Yup.string()
      .min(6, t("section30.text4"))
      .required(t("section30.text5")),
    conformPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("section30.text6"))
      .required(t("section30.text7")),
  });
  return (
    <>
      <div className="container">
        <div className="logo">
          <a href="/">
            <img src={icons.logo} width="180px" alt="Logo" />
          </a>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-2" style={{ width: "50%" }}>
            <img
              src={icons.loginpageimg}
              alt="Service"
              style={{ width: "100%" }}
            />
          </div>

          <div className="col-2" style={{ width: "50%" }}>
            <div className="register-modern">
              <div className="form-container-register">
                <div className="form-btn" style={{ marginBottom: "0px" }}>
                  <span>{t("section22.text1")}</span>
                  {/* <hr id="Indicator" /> */}
                <div className="header-underline mx-auto"></div>

                </div>
                <Formik
                  enableReinitialize
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handelSave}
                >
                  {(props) => {
                    const { values, errors, handleChange, submitForm } = props;
                    const { email, password } = values;
                    return (
                      <form
                        className="register-form"
                        style={{ marginTop: "0px" }}
                      >
                        <div className="d-flex flex-column gap-3 mb-3">
                          <div>
                            <p className="m-0" style={{ color:"#0d6b38" }}>{t("section22.text2")}</p>
                            <input
                              placeholder="Enter Password"
                              id="email"
                              value={email}
                              error={errors.email}
                              onChange={handleChange}
                              className="m-0"
                            />
                          </div>
                          <div>
                            <p className="m-0" style={{ color:"#0d6b38" }}>{t("section22.text3")}</p>
                            <input
                              placeholder="Enter Confirm password"
                              id="password"
                              value={password}
                              error={errors.password}
                              onChange={handleChange}
                              className="m-0"
                            />
                          </div>
                        </div>

                        <button
                          btnStyle={email && password ? "PD" : "DD"}
                          className="btn12 loginsbtn"
                          onClick={submitForm}
                          btnLoading={btnLoading}
                        >
                          {t("section22.text4")}
                        </button>
                        <div
                          className="mt-3 link-text"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/sign-in")}
                        >
                          {t("section22.text5")}
                        </div>
                      </form>
                    );
                  }}
                </Formik>
                <h5 style={{ marginTop: "10px" }}>
                  {/* Placeholder for message */}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetSection;
