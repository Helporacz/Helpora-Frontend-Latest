// src/pages/Privacy/Privacy.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();

  const policy = t("privacy", { returnObjects: true }) || {};
  const title = policy.title || "Privacy Policy";
  const brand = policy.brand || "Helpora.cz";
  const lastUpdated = policy.lastUpdated || "Last updated: January 1, 2026";
  const sections = Array.isArray(policy.sections) ? policy.sections : [];

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#ffffff",
      color: "#111827",
      padding: "24px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, "Helvetica Neue", sans-serif',
    },
    container: {
      maxWidth: "920px",
      margin: "0 auto",
    },
    header: {
      borderBottom: "1px solid #e5e7eb",
      paddingBottom: "16px",
      marginBottom: "20px",
    },
    h1: {
      margin: 0,
      fontSize: "32px",
      lineHeight: 1.2,
      fontWeight: 800,
      color: "#111827",
    },
    brand: {
      marginTop: "8px",
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
    },
    updated: {
      marginTop: "6px",
      fontSize: "14px",
      color: "#6b7280",
    },
    section: {
      padding: "14px 0",
      borderBottom: "1px solid #f3f4f6",
    },
    h2: {
      margin: "0 0 10px 0",
      fontSize: "18px",
      fontWeight: 800,
      color: "#111827",
    },
    p: {
      margin: "0 0 10px 0",
      fontSize: "14px",
      lineHeight: 1.75,
      color: "#111827",
    },
    ul: {
      margin: "0 0 10px 18px",
      padding: 0,
      fontSize: "14px",
      lineHeight: 1.75,
      color: "#111827",
    },
    li: { marginBottom: "6px" },
    contactLine: { marginTop: "6px" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>{title}</h1>
          <div style={styles.brand}>{brand}</div>
          <div style={styles.updated}>{lastUpdated}</div>
        </div>

        {sections.map((s, idx) => {
          const sectionTitle = s && s.title ? s.title : "";
          const paragraphs = s && Array.isArray(s.paragraphs) ? s.paragraphs : [];
          const bullets = s && Array.isArray(s.bullets) ? s.bullets : [];

          return (
            <div key={s.id || idx} style={styles.section}>
              {sectionTitle ? <h2 style={styles.h2}>{sectionTitle}</h2> : null}

              {paragraphs.map((text, pIdx) => (
                <p key={pIdx} style={styles.p}>
                  {text}
                </p>
              ))}

              {bullets.length > 0 ? (
                <ul style={styles.ul}>
                  {bullets.map((b, bIdx) => (
                    <li key={bIdx} style={styles.li}>
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}

              {s && s.contactEmail ? (
                <p style={{ ...styles.p, ...styles.contactLine }}>
                  📧 {s.contactEmail}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Privacy;
