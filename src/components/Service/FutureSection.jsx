import "./FutureSection.css";
import futureImg from "../../assets/images/Wavy_Tech-10_Single-06.jpg";
import { useNavigate } from "react-router-dom";
import { LuRocket } from "react-icons/lu";
import { IoEarthSharp } from "react-icons/io5";
import { PiLightbulbBold } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";
const FutureSection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <section className="future-section py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 order-lg-1 order-2">
            <h3 className="future-title">{t("section8.text1")}</h3>
            <h2 className="future-heading">{t("section8.text2")}</h2>

            <p className="future-text">{t("section8.text3")}</p>

            <p className="future-text">{t("section8.text4")}</p>

            <p className="future-text">{t("section8.text5")}</p>

            <button
              onClick={() =>
                navigate(getLocalizedPath("/register", i18n.language))
              }
              className="service-btn px-3 mt-3"
            >
              {t("section8.text6")}
            </button>
          </div>

          <div className="col-lg-6 mb-4 mb-lg-0 order-lg-2 order-1 text-center">
            <div className="future-image-wrapper">
              <img
                src={futureImg}
                alt="Future Growth"
                className="future-main-img img-fluid"
              />
              <div
                className="floating-icon f-icon-1"
                style={{ color: "#9B1313" }}
              >
                <LuRocket />
              </div>
              <div
                className="floating-icon f-icon-2"
                style={{ color: "#143A78" }}
              >
                <IoEarthSharp />
              </div>
              <div
                className="floating-icon f-icon-3"
                style={{ color: "#DBA400" }}
              >
                <PiLightbulbBold />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureSection;
