import "./MissionValues.css";
// import missionImg from "../../assets/images/mission.png"; // optional
import { FaShieldAlt } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { LuBicepsFlexed } from "react-icons/lu";
import { GiStarsStack } from "react-icons/gi";
import { useTranslation } from "react-i18next";

const MissionValues = () => {
  const { t, i18n } = useTranslation();

  return (
    <section className="mission-section py-5">
      <div className="container">
        {/* TITLE */}
        <div className="text-center mb-5">
          <h3 className="mission-subtitle">{t("section11.text1")}</h3>
          <h2 className="mission-title">{t("section11.text2")}</h2>

          <p className="mission-description">{t("section11.text3")}</p>
        </div>

        {/* VALUES GRID */}
        <div className="row g-4 justify-content-center">
          {/* CARD 1 */}
          <div className="col-md-6 col-lg-3" style={{ cursor: "pointer" }}>
            <div className="mission-card">
              <div className="mission-icon" style={{ color: "#E26F66" }}>
                <FaShieldAlt />
              </div>
              <h4 className="mission-card-title">{t("section11.text4")}</h4>
              <p className="mission-card-text">{t("section11.text5")}</p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="col-md-6 col-lg-3" style={{ cursor: "pointer" }}>
            <div className="mission-card">
              <div className="mission-icon" style={{ color: "#8FD9FB" }}>
                <FiBookOpen />
              </div>
              <h4 className="mission-card-title">{t("section11.text6")}</h4>
              <p className="mission-card-text">{t("section11.text7")}</p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="col-md-6 col-lg-3" style={{ cursor: "pointer" }}>
            <div className="mission-card">
              <div className="mission-icon" style={{ color: "#EFBF04" }}>
                <LuBicepsFlexed />
              </div>
              <h4 className="mission-card-title">{t("section11.text8")}</h4>
              <p className="mission-card-text">{t("section11.text9")}</p>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="col-md-6 col-lg-3" style={{ cursor: "pointer" }}>
            <div className="mission-card">
              {/* <div className="mission-icon">✨</div> */}
              <div className="mission-icon" style={{ color: "#8479D9" }}>
                <GiStarsStack />
              </div>
              <h4 className="mission-card-title">{t("section11.text10")}</h4>
              <p className="mission-card-text">{t("section11.text11")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionValues;
