import Button from "components/form/Button";
import { ErrorMessage, Field, Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, throwError, throwSuccess } from "store/globalSlice";
import * as Yup from "yup";
import "./admin.scss";
import logo from "../../../assets/images/White_Logo.png";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";
const AdminLogin = () => {
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);

  const handelSave = async (values) => {
    setBtnLoading(true);
    const response = await dispatch(login(values));
    if (response?.status === 200) {
      dispatch(throwSuccess(response?.message));
      navigate(getLocalizedPath("/dashboard", i18n.language));
    } else {
      dispatch(throwError(response?.message));
    }

    setBtnLoading(false);
  };

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("section27.text1"))
      .required(t("section27.text2")),
    password: Yup.string().required(t("section27.text3")),
  });

  return (
    <>
      <div className="login-container321">
        <div className="logo-section32">
          <a href={getLocalizedPath("/", i18n.language)}>
            <img src={logo} alt="Logo" />
          </a>
        </div>
        <hr></hr>
        <div className="form-section32">
          <h1 className="main-admin-titles">{t("section18.text1")}</h1>
          <h3 className="main-text-adminportal">{t("section18.text2")}</h3>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handelSave}
          >
            {(props) => {
              const { values, submitForm } = props;
              const { email, password } = values;
              return (
                <form
                  onSubmit={submitForm}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitForm(e);
                    }
                  }}
                >
                  <div className="cmb-245">
                    <p className="m-0 puttitle">{t("section18.text3")}</p>
                    <div className="input-wrapper">
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter Email Address"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="invalid-feedback d-block"
                      />
                    </div>
                  </div>

                  <div className="cmb-167">
                    <p className="m-0 puttitle">{t("section18.text4")}</p>
                    <div className="input-wrapper321">
                      <Field
                        type="Password"
                        id="password"
                        name="password"
                        placeholder="Enter your Password"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="invalid-feedback d-block"
                      />
                    </div>
                  </div>

                  <div
                    className="cpt-14"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      btnText="SIGN IN"
                      btnStyle={email && password ? "PD" : "DD"}
                      onClick={submitForm}
                      btnLoading={btnLoading}
                    />
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
