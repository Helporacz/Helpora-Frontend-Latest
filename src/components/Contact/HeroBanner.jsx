import { useNavigate } from "react-router-dom";
import "./HeroBanner.scss";
import { getDataFromLocalStorage } from "utils/helpers";

import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";

const HeroBanner = ({ title, image }) => {
  const navigate = useNavigate();
  const token = getDataFromLocalStorage("token");
  const { t, i18n } = useTranslation();
  return (
    <section className="hero-banner position-relative d-flex align-items-center justify-content-center">
      {/* Background Image */}
      <img
        src={image}
        alt="Hero Banner"
        style={{ height: "80vh", width: "100%" }}
        className="hero-bg-img position-absolute"
      />

      {/* Gradient + Glass Overlay */}
      <div className="hero-overlay position-absolute"></div>

      {/* Content */}
      <div className="hero-content text-center position-relative px-4">
        <h1 className="hero-title fw-bold text-white mb-3">{title}</h1>

        <p className="hero-subtitle text-light fs-5 mb-4">
          {t("section5.text1")}
        </p>

        <div className="button-group d-flex justify-content-center gap-3">
          <button
            onClick={(e) => {
              token
                ? e.preventDefault()
                : navigate(getLocalizedPath("/sign-in", i18n.language));
            }}
            className="hero-btn primary-btn"
          >
            {t("section5.text2")}
            <FaArrowRight className="ms-2" />
          </button>

          <button
            className="hero-btn outline-btn"
            onClick={() =>
              navigate(getLocalizedPath("/contact", i18n.language))
            }
          >
            <FaInfoCircle className="me-2" /> {t("section5.text3")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
