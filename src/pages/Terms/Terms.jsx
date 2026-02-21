import React from "react";
import { useTranslation } from "react-i18next";
import "./Terms.scss";

const Terms = () => {
  const { t } = useTranslation();
  const lang = (t?.i18n?.language || "").toLowerCase();
  const disclaimer = lang.startsWith("en")
    ? "Helpora.cz is an online marketplace connecting users with independent service providers. Helpora.cz does not employ providers or participate in payments or service delivery."
    : "Helpora.cz je online tržiště propojující uživatele s nezávislými poskytovateli služeb. Helpora.cz není zaměstnavatelem poskytovatelů a neúčastní se plateb ani poskytování služeb.";

  return (
    <section className="terms-page">
      <div className="container">
        <div className="terms-card">
          <h1>{t("terms.title")}</h1>
          <p className="terms-updated">{t("terms.updated")}</p>

          <div className="terms-disclaimer">
            <h2>{t("terms.disclaimerTitle") || "Platform Disclaimer"}</h2>
            <p>{disclaimer}</p>
          </div>

          <h2>{t("terms.section1.title")}</h2>
          <p>{t("terms.section1.body")}</p>

          <h2>{t("terms.section2.title")}</h2>
          <p>{t("terms.section2.body")}</p>

          <h2>{t("terms.section3.title")}</h2>
          <p>{t("terms.section3.body")}</p>

          <h2>{t("terms.section4.title")}</h2>
          <p>{t("terms.section4.body")}</p>

          <h2>{t("terms.section5.title")}</h2>
          <p>{t("terms.section5.body")}</p>
        </div>
      </div>
    </section>
  );
};

export default Terms;
