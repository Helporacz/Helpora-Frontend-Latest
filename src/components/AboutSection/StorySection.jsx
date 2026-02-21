import "./StorySection.css";
import storyImg from "../../assets/images/undraw_good-team_zww8.svg"; // or GIF
import { useTranslation } from "react-i18next";

const StorySection = () => {
  const { t, i18n } = useTranslation();

  return (
    <section className="story-section ">
      <div className="container">
        <div className="row align-items-center">
          {/* LEFT IMAGE / GIF */}
          <div className="col-lg-6 mb-4 mb-lg-0 text-center">
            <div className="story-image-wrapper">
              <img
                src={storyImg}
                alt="How Helpora Started"
                className="story-main-img img-fluid"
              />

              {/* Floating elements */}
              <div className="story-floating circle-s1"></div>
              <div className="story-floating circle-s2"></div>
              <div className="story-floating circle-s3"></div>
            </div>
          </div>

          {/* RIGHT TEXT */}
          <div className="col-lg-6">
            <h3 className="story-subtitle">{t("section10.text1")}</h3>
            <h2 className="story-heading">{t("section10.text2")}</h2>

            <p className="story-text">{t("section10.text3")}</p>

            <p className="story-text">{t("section10.text4")}</p>

            <p className="story-text">{t("section10.text5")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
