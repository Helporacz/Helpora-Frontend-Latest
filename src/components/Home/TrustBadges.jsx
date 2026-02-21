import React from "react";
import { FiShield, FiCheckCircle, FiUserCheck } from "react-icons/fi";
import { AiOutlineIdcard } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import "./TrustBadges.scss";

const TrustBadges = () => {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || "").toLowerCase().startsWith("en");

  const items = [
    {
      icon: <AiOutlineIdcard />,
      title: isEn ? "ID verified" : "Ověřený doklad",
      desc: isEn
        ? "Providers present ID to our team for verification."
        : "Poskytovatelé předkládají doklad totožnosti ke kontrole.",
    },
    {
      icon: <FiShield />,
      title: isEn ? "Background check" : "Kontrola bezúhonnosti",
      desc: isEn
        ? "Background screening status (where available)."
        : "Stav prověření bezúhonnosti (pokud je k dispozici).",
    },
    {
      icon: <FiCheckCircle />,
      title: isEn ? "Verified by Helpora" : "Ověřeno Helpora",
      desc: isEn
        ? "Manual admin approval for trusted providers."
        : "Ruční schválení administrátorem pro ověřené poskytovatele.",
    },
    {
      icon: <FiUserCheck />,
      title: isEn ? "Customer-reviewed" : "Hodnoceno zákazníky",
      desc: isEn
        ? "Ratings and reviews stay linked to real profiles."
        : "Hodnocení a recenze jsou propojeny s reálnými profily.",
    },
  ];

  return (
    <section className="trust-badges">
      <div className="container">
        <div className="trust-badges__header">
          <p className="eyebrow">
            {isEn ? "Provider trust & verification" : "Důvěra a ověření poskytovatelů"}
          </p>
          <h2>
            {isEn
              ? "Layers of verification you can see"
              : "Vrstvy ověření, které máte na očích"}
          </h2>
          <p className="subtitle">
            {isEn
              ? "Clear badges show when a provider passed ID check, admin review, and other steps."
              : "Jasné odznaky ukazují, kdy poskytovatel prošel kontrolou dokladu, schválením administrátorem a dalšími kroky. "}
          </p>
        </div>
        <div className="trust-badges__grid">
          {items.map((item) => (
            <div className="trust-badges__card" key={item.title}>
              <div className="trust-badges__icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
