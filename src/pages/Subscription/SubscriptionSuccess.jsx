import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loader from "components/layouts/Loader/Loader";
import { api } from "services";
import { commonRoute } from "utils/constants";
import { getLocalizedPath } from "utils/localizedRoute";
import { storeLocalStorageData } from "utils/helpers";
import "./SubscriptionSuccess.scss";

const SubscriptionSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const syncStatus = async () => {
      const response = await api.get("/stripe/subscription-status");
      const subscriptionStatus = response?.data?.status || "inactive";
      const isActive = !!response?.data?.isActive;

      localStorage.setItem("subscriptionStatus", subscriptionStatus);
      localStorage.setItem("subscriptionActive", isActive ? "true" : "false");
      storeLocalStorageData({
        subscriptionStatus,
        subscriptionActive: isActive,
      });

      if (isActive) {
        setStatus("active");
        setTimeout(() => {
          navigate(getLocalizedPath(commonRoute.dashboard, i18n.language));
        }, 1200);
      } else {
        setStatus("pending");
      }
    };

    syncStatus();
  }, [navigate, i18n.language]);

  return (
    <div className="subscription-success">
      <div className="subscription-success-card">
        {status === "loading" && (
          <>
            <Loader size="md" />
            <p>{t("subscription.successBody")}</p>
          </>
        )}

        {status === "active" && (
          <>
            <h2>{t("subscription.successTitle")}</h2>
            <p>{t("subscription.successBody")}</p>
          </>
        )}

        {status === "pending" && (
          <>
            <h2>{t("subscription.pendingTitle")}</h2>
            <p>{t("subscription.pendingBody")}</p>
            <button
              type="button"
              className="btn1 btn-submit"
              onClick={() =>
                navigate(getLocalizedPath(commonRoute.pricing, i18n.language))
              }
            >
              {t("subscription.cta")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
