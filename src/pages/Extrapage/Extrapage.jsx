import React from "react";
import "./Extrapage.scss";
import imagssds from "../../assets/images/final-img.png";
import { FaCheckCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Extrapage = () => {
    const { t, i18n } = useTranslation();
  return (
    <section className="home-service-section py-md-5 py-2">
      <div className="container">
        <div className="row align-items-center flex-column flex-md-row">
          {/* LEFT SIDE */}
          <div className="col-md-6">
            <div className="service-left">
              <h2 className="service-title">
                {t("section3.text1")}
              </h2>

              <p className="service-description">
                {t("section3.text2")}
              </p>

              <ul className="service-points list-unstyled mt-4 mb-4">
                <li>
                  <FaCheckCircle className="point-icon text-dark me-2" />{t("section3.text3")}
                </li>
                <li>
                  <FaCheckCircle className="point-icon text-dark me-2" />{t("section3.text4")}
                </li>
                <li>
                  <FaCheckCircle className="point-icon text-dark me-2" />{t("section3.text5")}
                </li>
                <li>
                  <FaCheckCircle className="point-icon text-dark me-2" />{t("section3.text6")}
                </li>
              </ul>

              <button className="service-btn">{t("section3.text7")}</button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-md-6">
            <div className="service-right text-center text-md-end mt-4 mt-md-0">
              <img
                src={imagssds}
                alt="Service"
                className="service-image img-fluid rounded"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Extrapage;
