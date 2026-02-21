import "./communityImpact.css";
import communityImg from "../../assets/images/community.svg";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { BsRocket } from "react-icons/bs";
import { GiBulb } from "react-icons/gi";
import { BsFillBagHeartFill } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";
const CommunityImpact = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <section className="container community-impact-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0 text-center">
            <div className="impact-image-wrapper">
              <img
                src={communityImg}
                alt="Community Support"
                className="impact-main-img img-fluid"
              />
              <div
                className="floating-icon icon-1"
                style={{ color: "#51158C" }}
              >
                <BsRocket />
              </div>
              <div
                className="floating-icon icon-2"
                style={{ color: "#A20842" }}
              >
                <GiBulb />
              </div>
              <div
                className="floating-icon icon-3"
                style={{ color: "#A35A00" }}
              >
                <BsFillBagHeartFill />
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <h3 className="impact-title">{t("section7.text1")}</h3>
            <h2 className="impact-heading">{t("section7.text2")}</h2>

            <p className="impact-text">{t("section7.text3")}</p>

            <ul className="impact-list">
              <li>
                <FaCheckCircle className="point-icon text-black me-2" />
                {t("section7.text4")}
              </li>
              <li>
                <FaCheckCircle className="point-icon text-black me-2" />
                {t("section7.text5")}
              </li>
              <li>
                <FaCheckCircle className="point-icon text-black me-2" />
                {t("section7.text6")}
              </li>
            </ul>

            <p className="impact-bottom-text">{t("section7.text7")}</p>

            <button
              onClick={() => {
                navigate(getLocalizedPath("/contact", i18n.language));
              }}
              className="service-btn px-3 mt-3"
            >
              {t("section7.text8")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpact;
