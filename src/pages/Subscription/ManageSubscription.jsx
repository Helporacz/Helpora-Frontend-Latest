import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Loader from "components/layouts/Loader/Loader";
import { api } from "services";
import { throwError } from "store/globalSlice";
import { commonRoute } from "utils/constants";
import { getLocalizedPath } from "utils/localizedRoute";
import { normalizeLanguage } from "@/lib/i18n-client";

const ManageSubscription = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language || "cz");

  // Robust translator: tries subscription.* first, then subscribers.*, then plain fallback text
  const tr = useCallback(
    (primaryKey, fallbackKey, fallbackText) =>
      t(primaryKey, {
        defaultValue: t(fallbackKey, { defaultValue: fallbackText }),
      }),
    [t]
  );

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    const response = await api.get("/stripe/subscription-status");

    if (response?.status === 200) {
      setStatusData(response?.data || null);
    } else {
      dispatch(throwError(response?.message || t("subscription.inactiveNotice")));
    }

    setLoading(false);
  }, [dispatch, t]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handlePortal = useCallback(async () => {
    setPortalLoading(true);

    const returnPath = getLocalizedPath(commonRoute.subscriptionManage, i18n.language);
    const response = await api.post("/stripe/billing-portal", { returnPath });

    if (response?.status === 200 && response?.data?.url) {
      window.location.href = response.data.url;
    } else {
      dispatch(throwError(response?.message || t("subscription.errorStart")));
    }

    setPortalLoading(false);
  }, [dispatch, i18n.language, t]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleDateString();
  };

  const formatAmount = (amount, currency) => {
    if (!amount || !currency) return "-";
    try {
      const numberLocale = currentLang === "cz" ? "cs-CZ" : currentLang === "ru" ? "ru-RU" : "en-US";
      return new Intl.NumberFormat(numberLocale, {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    } catch (err) {
      return `${amount / 100} ${currency.toUpperCase()}`;
    }
  };

  const displayStatus = statusData?.cancelAtPeriodEnd
    ? tr("subscription.cancellingLabel", "subscribers.cancelingLabel", "Cancelling")
    : statusData?.status || "inactive";

  const statusMeta = useMemo(() => {
    const s = (statusData?.status || "inactive").toLowerCase();
    const cancelling = !!statusData?.cancelAtPeriodEnd;

    if (cancelling) {
      return {
        label: tr("subscription.cancellingLabel", "subscribers.cancelingLabel", "Cancelling"),
        bg: "#FFF7ED",
        fg: "#9A3412",
        br: "#FED7AA",
      };
    }

    if (s === "active") {
      return {
        label: tr("subscription.statusActive", "subscribers.statusActive", "Active"),
        bg: "#ECFDF5",
        fg: "#065F46",
        br: "#A7F3D0",
      };
    }

    if (s === "trialing") {
      return {
        label: tr("subscription.statusTrialing", "subscribers.statusTrialing", "Trialing"),
        bg: "#EFF6FF",
        fg: "#1D4ED8",
        br: "#BFDBFE",
      };
    }

    if (s === "past_due" || s === "pastdue") {
      return {
        label: tr("subscription.statusPastDue", "subscribers.statusPastDue", "Past due"),
        bg: "#FEF2F2",
        fg: "#991B1B",
        br: "#FECACA",
      };
    }

    if (s === "canceled" || s === "cancelled") {
      return {
        label: tr("subscription.statusCanceled", "subscribers.statusCanceled", "Canceled"),
        bg: "#F3F4F6",
        fg: "#374151",
        br: "#E5E7EB",
      };
    }

    return {
      label: displayStatus,
      bg: "#F3F4F6",
      fg: "#374151",
      br: "#E5E7EB",
    };
  }, [displayStatus, statusData?.cancelAtPeriodEnd, statusData?.status, tr]);

  const styles = useMemo(() => {
    const pageBg = "#F7F8FC";
    const cardBg = "#FFFFFF";
    const text = "#0F172A";
    const muted = "#64748B";
    const border = "#E5E7EB";
    const shadow = "0 12px 30px rgba(15, 23, 42, 0.08)";
    const shadowSoft = "0 10px 24px rgba(15, 23, 42, 0.06)";
    const radius = 16;

    return {
      page: {
        minHeight: "100vh",
        background: pageBg,
        padding: "28px 16px",
        display: "flex",
        justifyContent: "center",
      },
      container: { width: "100%",  },

      headerRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 16,
      },
      titleBlock: { display: "flex", flexDirection: "column", gap: 6 },
      title: { margin: 0, color: text, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" },
      subtitle: { margin: 0, color: muted, fontSize: 14, lineHeight: 1.45, maxWidth: 720 },

      badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid ${statusMeta.br}`,
        background: statusMeta.bg,
        color: statusMeta.fg,
        fontWeight: 700,
        fontSize: 13,
        whiteSpace: "nowrap",
      },
      badgeDot: { width: 8, height: 8, borderRadius: 999, background: statusMeta.fg, opacity: 0.9 },

      mainCard: {
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: radius,
        boxShadow: shadow,
        overflow: "hidden",
      },

      topArea: {
        padding: 18,
        borderBottom: `1px solid ${border}`,
        background:
          "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 40%, rgba(99,102,241,0.06) 100%)",
      },

      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 14,
        padding: 18,
      },

      statCard: {
        borderRadius: 14,
        border: `1px solid ${border}`,
        boxShadow: shadowSoft,
        background: "#FFFFFF",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 92,
      },
      statLabel: {
        margin: 0,
        color: muted,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      },
      statValue: {
        margin: 0,
        color: text,
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: "-0.02em",
      },
      statHint: { margin: 0, color: muted, fontSize: 12 },

      col4: { gridColumn: "span 4" },
      col12: { gridColumn: "span 12" },

      tableWrap: {
        borderRadius: 14,
        border: `1px solid ${border}`,
        overflow: "hidden",
        background: "#FFFFFF",
      },
      tableHeader: {
        padding: "12px 14px",
        background: "#FAFAFF",
        borderBottom: `1px solid ${border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      },
      tableTitle: { margin: 0, color: text, fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" },
      tableSub: { margin: 0, color: muted, fontSize: 12 },

      table: { width: "100%", borderCollapse: "collapse" },
      tr: { borderBottom: `1px solid ${border}` },
      th: {
        textAlign: "left",
        padding: "10px 14px",
        color: muted,
        fontSize: 12,
        fontWeight: 800,
        background: "#FFFFFF",
        width: "46%",
      },
      td: { padding: "10px 14px", color: text, fontSize: 13, fontWeight: 700 },

      warning: {
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid #FECACA",
        background: "#FEF2F2",
        color: "#991B1B",
        fontSize: 13,
        fontWeight: 700,
      },

      footer: {
        padding: 18,
        borderTop: `1px solid ${border}`,
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
        background: "#FFFFFF",
      },
      button: {
        border: "none",
        cursor: portalLoading ? "not-allowed" : "pointer",
        padding: "12px 16px",
        borderRadius: 12,
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: "-0.01em",
        color: "#FFFFFF",
        background: portalLoading
          ? "linear-gradient(135deg, rgba(59,130,246,0.55), rgba(99,102,241,0.55))"
          : "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
        boxShadow: "0 10px 20px rgba(59,130,246,0.25)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        minWidth: 180,
        opacity: portalLoading ? 0.9 : 1,
      },
      btnSpinner: {
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.45)",
        borderTopColor: "rgba(255,255,255,0.95)",
        animation: "spin 0.9s linear infinite",
      },

      loadingWrap: { minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" },
    };
  }, [portalLoading, statusMeta]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingWrap}>
            <Loader size="md" />
          </div>
        </div>
      </div>
    );
  }

  const isActive = !!statusData?.isActive;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        <div style={styles.mainCard}>
          <div style={styles.topArea}>
            <div style={styles.headerRow}>
              <div style={styles.titleBlock}>
                <h2 style={styles.title}>{t("subscription.manageTitle")}</h2>
                <p style={styles.subtitle}>{t("subscription.manageSubtitle")}</p>
              </div>

              <div style={styles.badge} title={t("subscription.statusLabel")}>
                <span style={styles.badgeDot} />
                <span>{statusMeta.label}</span>
              </div>
            </div>

            {!isActive && <div style={styles.warning}>{t("subscription.inactiveNotice")}</div>}
          </div>

          <div style={styles.grid}>
            <div style={{ ...styles.statCard, ...styles.col4 }}>
              <p style={styles.statLabel}>{t("subscription.priceLabel")}</p>
              <p style={styles.statValue}>{formatAmount(statusData?.unitAmount, statusData?.currency)}</p>
            </div>

            <div style={{ ...styles.statCard, ...styles.col4 }}>
              <p style={styles.statLabel}>{t("subscription.nextBillingLabel")}</p>
              <p style={styles.statValue}>{formatDate(statusData?.currentPeriodEnd)}</p>
            </div>

            <div style={{ ...styles.statCard, ...styles.col4 }}>
              <p style={styles.statLabel}>{t("subscription.trialLabel")}</p>
              <p style={styles.statValue}>{formatDate(statusData?.trialEnd)}</p>
              <p style={styles.statHint}>{statusData?.trialEnd ? "" : t("subscription.statusLabel")}</p>
            </div>

            <div style={{ ...styles.tableWrap, ...styles.col12 }}>
              <div style={styles.tableHeader}>
                <div>
                  <p style={styles.tableTitle}>{t("subscription.manageTitle")}</p>
                  <p style={styles.tableSub}>{t("subscription.manageSubtitle")}</p>
                </div>
                <div style={styles.badge}>
                  <span style={styles.badgeDot} />
                  <span>{statusMeta.label}</span>
                </div>
              </div>

              <table style={styles.table}>
                <tbody>
                  <tr style={styles.tr}>
                    <th style={styles.th}>{t("subscription.statusLabel")}</th>
                    <td style={styles.td}>{statusMeta.label}</td>
                  </tr>

                  <tr style={styles.tr}>
                    <th style={styles.th}>{t("subscription.priceLabel")}</th>
                    <td style={styles.td}>{formatAmount(statusData?.unitAmount, statusData?.currency)}</td>
                  </tr>

                  <tr style={styles.tr}>
                    <th style={styles.th}>{t("subscription.trialLabel")}</th>
                    <td style={styles.td}>{formatDate(statusData?.trialEnd)}</td>
                  </tr>

                  <tr style={styles.tr}>
                    <th style={styles.th}>{t("subscription.nextBillingLabel")}</th>
                    <td style={styles.td}>{formatDate(statusData?.currentPeriodEnd)}</td>
                  </tr>

                  <tr>
                    <th style={styles.th}>{t("subscription.cancelAtPeriodEndLabel")}</th>
                    <td style={styles.td}>{statusData?.cancelAtPeriodEnd ? tr("common.yes", "Yes", "Yes") : tr("common.no", "No", "No")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={handlePortal} disabled={portalLoading} style={styles.button}>
              {portalLoading && <span style={styles.btnSpinner} />}
              {portalLoading ? t("subscription.loading") : t("subscription.manageButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;
