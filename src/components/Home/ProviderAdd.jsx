import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaAward, FaStar } from "react-icons/fa";
import "./AddProvider.scss";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";
import { getDataFromLocalStorage } from "utils/helpers";

const ProviderAdd = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const token = getDataFromLocalStorage("token");

  return (
    <div className="">
      <div className="col-lg-12">
        <div className="provider-card animate-fadeIn">
          <div className="content-side">
            <div className="badge">
              <FaAward className="icon" />
              <span>{t("section1.text1")}</span>
            </div>

            <h1 className="main-title">
              {t("section1.text2")}
              <span className="highlight"> {t("section1.text3")}{" "}</span>
              {t("section1.text4")}
            </h1>

            <p className="subtitle">
              {t("section1.text5")}
              <span className="free-months"> {t("section1.text6")}</span>{" "}
              {t("section1.text7")}
            </p>
          </div>
          <div className="my-2">
            {!token && (
            <button
              className="cta-button"
              onClick={() =>
                navigate(getLocalizedPath("/sign-up", i18n.language))
              }
              style={{ color:"white" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div>
                  <span className="m-0">{t("section1.text8")}</span>
                </div>
                <div>
                  <FaArrowRight className="arrow" />
                </div>
              </div>
              <div className="shine"></div>
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAdd;
