import { ErrorMessage, Field, Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { forgetPassword, throwError, throwSuccess } from "store/globalSlice";
import icons from "utils/constants/icons";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslation } from "react-i18next";

const Forgots = () => {
  const { t, i18n } = useTranslation();

  const registerSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .required(t("section32.text2"))
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        t("section32.text3")
      ),
  });

  const dispatch = useDispatch();
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await dispatch(forgetPassword(values));
      
      if (response?.status === 200) {
        
        dispatch(throwSuccess(t("section29.text8")));
      } else {
        dispatch(throwError(t("section29.text6")));
      }
    } catch (error) {
      console.log(error,'error');
      
      dispatch(throwError(t("section29.text7")));
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    email: "",
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
            <div className="form-container-register d-flex flex-column justify-content-between" style={{ minHeight:"300px" }}>
              <div className="form-btn" style={{ marginBottom: "0px" }}>
                <span>{t("section17.text6")}</span>
                {/* <hr id="Indicator" /> */}
                <div className="header-underline mx-auto"></div>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={registerSchema}
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
                          <p className="m-0" style={{ color: "#0d6b38" }}>
                            {t("section17.text2")}
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
                      </div>

                      <button
                        type="submit"
                        className="btn12 loginsbtn"
                        disabled={btnLoading}
                      >
                        {btnLoading ? "Forgotpassword ..." : t("ResetPassword.button")}
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
