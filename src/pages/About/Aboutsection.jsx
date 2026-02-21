import "./About.css";
import heroGif from "../../assets/images/undraw_connecting-teams_nnjy.svg";
import { useTranslation } from "react-i18next";

const AboutHero = () => {
  const { t, i18n } = useTranslation();
  return (
    <section className="about-hero-section d-flex align-items-center">
      <div className="container">
        <div className="row align-items-center">
          {/* LEFT CONTENT */}
          <div className="col-lg-6 order-2 order-lg-1">
            <h1 className="about-title">{t("section9.text1")}</h1>

            <p className="about-text">
              {/* At Helpora.cz, we believe life runs smoother when people can rely on 
              trusted help — anytime, anywhere. */}
              {t("section9.text2")}
            </p>

            <p className="about-text">
              {/* We’re building a simple, reliable way to connect everyday needs with 
              skilled local professionals across the Czech Republic. */}
              {t("section9.text3")}
            </p>

            <p className="about-text">
              {/* From home cleaning and repairs to event planning, tutoring, and beauty 
              care, Helpora.cz helps you find the right help fast — safely 
              and transparently. */}
              {t("section9.text4")}
            </p>
            {/* 
            <p className="about-text">
              We are not just another marketplace — we are a community of doers, 
              helpers, and local experts who believe that quality service starts 
              with human connection.
            </p> */}
          </div>

          {/* RIGHT VISUAL */}
          <div className="col-lg-6 order-1 order-lg-2 text-center mb-4 mb-lg-0">
            <div className="about-hero-image-wrapper">
              <img
                src={heroGif}
                alt="About Helpora"
                className="about-main-img img-fluid"
              />

              {/* Floating Elements */}
              <div className="about-floating-circle circle-1"></div>
              <div className="about-floating-circle circle-2"></div>
              <div className="about-floating-circle circle-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
