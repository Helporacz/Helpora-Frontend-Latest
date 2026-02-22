import React from "react";
import "./Footer.scss";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import logo from "../../assets/images/White_Logo.png";
import { MdEmail, MdPhone } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getLocalizedPath } from "utils/localizedRoute";
import { normalizeLanguage } from "@/lib/i18n-client";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language || "cz");
  const disclaimer =
    {
      en: "Helpora.cz is an online marketplace connecting users with independent service providers. Helpora.cz does not employ providers or participate in payments or service delivery.",
      cz: "Helpora.cz je online tržiště propojující uživatele s nezávislými poskytovateli služeb. Helpora.cz není zaměstnavatelem poskytovatelů a neúčastní se plateb ani poskytování služeb.",
      ru: "Helpora.cz — это онлайн-маркетплейс, который соединяет пользователей с независимыми поставщиками услуг. Helpora.cz не нанимает поставщиков и не участвует в оплате или предоставлении услуг.",
    }[language] ||
    "Helpora.cz is an online marketplace connecting users with independent service providers. Helpora.cz does not employ providers or participate in payments or service delivery.";

  const disclaimerTitle =
    t("terms.disclaimerTitle") || "Platform Disclaimer";
  const footerCompanyText = "2026 Helpora s.r.o. | IČO: 24497061 | DIČ: CZ24497061 |";

  return (
    <footer className="modern-footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="row g-4 py-5">
          {/* Brand Section */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand">
              <img
                src={logo}
                className="footer-logo mb-3"
                alt="Helpora Logo"
                height={50}
                width={150}
              />
              <p className="footer-description">
                {/* Our purpose is to serve high quality services at your doorstep. */}
                {t("section14.text1")}
              </p>
              <div className="footer-contact mt-4">
                <div className="contact-item">
                  <MdEmail className="contact-icon" />
                  <span>info@helpora.cz</span>
                </div>
                <div className="contact-item">
                  <MdPhone className="contact-icon" />
                  <span>+420 722 922 334</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="col-lg-2 col-md-6">
            <h3 className="footer-title">{t("section14.text2")}</h3>
            <ul className="footer-links">
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#education")}
                >
                  {t("section14.text3")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#gym")}
                >
                  {t("section14.text4")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#tutoring")}
                >
                  {t("section14.text5")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#painting")}
                >
                  {t("section14.text6")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#cleaning")}
                >
                  {t("section14.text7")}
                </span>
              </li>
            </ul>
          </div>

          {/* Pages Section */}
          <div className="col-lg-2 col-md-6">
            <h3 className="footer-title">{t("section14.text8")}</h3>
            <ul className="footer-links">
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(getLocalizedPath("/", i18n.language));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {t("section14.text9")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(getLocalizedPath("/service", i18n.language));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {t("section14.text10")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(getLocalizedPath("/about", i18n.language));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {t("section14.text11")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(getLocalizedPath("/contact", i18n.language));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {t("section14.text12")}
                </span>
              </li>
            </ul>
          </div>

          {/* Language Section */}
          <div className="col-lg-2 col-md-6">
            <h3 className="footer-title">{t("section14.text13")}</h3>
            <ul className="footer-links">
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#english")}
                >
                  {t("section14.text14")}
                </span>
              </li>
              <li>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#czech")}
                >
                  {t("section14.text15")}
                </span>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div className="col-lg-2 col-md-12">
            <h3 className="footer-title">{t("section14.text16")}</h3>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/profile.php?id=61585657406755"
                target="_blank"
                className="social-link facebook"
                style={{ cursor: "pointer" }}
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.instagram.com/helpora.cz/"
                target="_blank"
                className="social-link instagram"
                style={{ cursor: "pointer" }}
              >
                <FaInstagram />
              </a>

              <a
                // https://wa.me/<countrycode><number>
                href="https://wa.me/+420722922334"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link whatsapp"
                style={{ cursor: "pointer" }}
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="footer-copyright mb-0">
                {footerCompanyText}
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-legal">
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#privacy")}
                >
                  {t("section14.text18")}
                </span>
                <span className="separator">•</span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("#terms")}
                >
                  {t("section14.text19")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom-disclaimer text-center">
          <p className="footer-disclaimer-title">{disclaimerTitle}</p>
          <p className="footer-disclaimer-text">{disclaimer}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
