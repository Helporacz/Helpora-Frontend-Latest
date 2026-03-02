import React from "react";
import { useNavigate } from "react-router-dom";
import "./Becomeprovider.scss";
import { useTranslation } from "react-i18next";
import { getDataFromLocalStorage } from "utils/helpers";
import { getLocalizedPath } from "utils/localizedRoute";
const Becomeprovider = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const token = getDataFromLocalStorage("token");

  return (
    <div className="containerbecome">
      {!token && (
        <div className="become-actions">
          <button
            className="service-btns"
            onClick={() => navigate(getLocalizedPath("/sign-up", i18n.language))}
          >
            {t("section15.text1")}
          </button>
          <button
            className="service-btns secondary"
            onClick={() => navigate(getLocalizedPath("/login", i18n.language))}
          >
            {t("section15.text18")}
          </button>
        </div>
      )}
      <h1 className="titlesbecome">{t("section15.text2")} </h1>
      <ul className="becomeul">
        <li className="becomeli">
          {t("section15.text3")}{" "}
        </li>
        <li className="becomeli">
          {t("section15.text4")}{" "}
        </li>
        <li className="becomeli">
          {t(
            "section15.text19",
            "After signing in, you can switch between User and Provider roles anytime from your profile settings."
          )}
        </li>
      </ul>
      <h1 className="titlesbecome">{t("section15.text5")}</h1>
      <ul className="becomeul">
        <li className="becomeli">{t("section15.text6")} </li>
        <li className="becomeli">
          {t("section15.text7")}
        </li>
        <li className="becomeli">
          {t("section15.text8")}
        </li>
      </ul>
      <h1 className="titlesbecome">{t("section15.text9")}</h1>
      <ul className="becomeul">
        <li className="becomeli">
          {t("section15.text10")}
        </li>
        <li className="becomeli">
          {t("section15.text11")}
        </li>
      </ul>
      <h1 className="titlesbecome">{t("section15.text12")}</h1>
      <ul className="becomeul">
        <li className="becomeli">
          {t("section15.text13")}
        </li>
        <li className="becomeli">
          {t("section15.text14")}
        </li>
      </ul>
      <h1 className="titlesbecome">{t("section15.text15")}</h1>
      <ul className="becomeul">
        <li className="becomeli">
          {t("section15.text16")}
        </li>
        <li className="becomeli">
          {t("section15.text17")}
        </li>
      </ul>
    </div>
  );
};

export default Becomeprovider;
