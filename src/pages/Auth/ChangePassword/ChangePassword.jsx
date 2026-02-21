import React, { useState } from "react";
import Button from "components/form/Button";
import PasswordInput from "components/form/PasswordInput";
import TextInput from "components/form/TextInput";
import { commonRoute, icons } from "utils/constants";
import "./ChangePassword.scss";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/images/White_Logo.png";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const ChangePassword = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    // <div id="change-password-continer">
    //   <div className="change-password-block">
    //     <div className="change-password-heading-block bg-dashboard-primary cmb-24 cpt-16">
    //       <div
    //         className="change-password-logo-block cpb-8"
    //         style={{ background: "wheat" }}
    //       >
    //         <img src={icons.logo} alt="Pomonike-logo" />
    //       </div>
    //       <div
    //         className="change-password-logo-text text-17-500 color-blue-10"
    //         style={{ background: "wheat" }}
    //       >
    //         {t("section23.text1")}
    //       </div>
    //     </div>
    //     <div className="change-password-content-block cpt-40 cpb-40 cps-32 cpe-32">
    //       <div className="change-password-content-block-heading cmb-24">
    //         <div className="text-17-600  color-black-100">{t("section23.text6")}</div>
    //         <div className="text-15-500 color-black-80">
    //           {t("section23.text2")}
    //         </div>
    //       </div>

    //       <div>
    //         <div className="cmb-24">
    //           <TextInput
    //             label={t("section23.text3")}
    //             placeholder="Password102++"
    //             id="newPassword"
    //             value={newPassword}
    //             onChange={(e) => {
    //               setNewPassword(e.target.value);
    //             }}
    //           />
    //         </div>

    //         <div className="cmb-24">
    //           <PasswordInput
    //             label={t("section23.text4")}
    //             placeholder="Password102++"
    //             id="confirmPassword"
    //             value={confirmPassword}
    //             onChange={(e) => {
    //               setConfirmPassword(e.target.value);
    //             }}
    //           />
    //         </div>

    //         <div>
    //           <Button
    //             btnText={t("section23.text5")}
    //             btnStyle={newPassword && confirmPassword ? "PD" : "DD"}
    //             onClick={() => {
    //               navigate(commonRoute?.login);
    //             }}
    //           />
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="login-container321">
      <div className="logo-section32">
        <a href="/">
          <img src={logo} alt="Logo" />
        </a>
      </div>
      <hr></hr>
      <div className="form-section32">
        <h1 className="main-admin-titles">{t("section23.text2")}</h1>
        <h3 className="main-text-adminportal">{t("section23.text6")}</h3>
        <div className="cmb-245">
          <form
            action="
          "
          >
            <div className="input-wrapper">
              <TextInput
                label={t("section23.text3")}
                placeholder="Password102++"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
              />
            </div>

            <div className="input-wrapper">
              <PasswordInput
                label={t("section23.text4")}
                placeholder="Password102++"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </div>

            <div className="mt-3">
              <Button
                btnText={t("section23.text5")}
                btnStyle={newPassword && confirmPassword ? "PD" : "DD"}
                onClick={() => {
                  navigate(commonRoute?.login);
                }}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
