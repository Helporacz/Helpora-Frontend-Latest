import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { api } from "services";
import { handelLogout, throwError } from "store/globalSlice";
import { commonRoute } from "utils/constants";
import { getLocalizedPath } from "utils/localizedRoute";
import GoogleTranslate from "components/GoogleTranslate/GoogleTranslate";
import "./Pricing.scss";

const Pricing = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const successPath = `${getLocalizedPath(
        commonRoute.subscriptionSuccess,
        i18n.language
      )}?session_id={CHECKOUT_SESSION_ID}`;
      const cancelPath = getLocalizedPath(commonRoute.pricing, i18n.language);

      const response = await api.post("/stripe/create-checkout-session", {
        successPath,
        cancelPath,
      });

      if (response?.status === 200 && response?.data?.url) {
        window.location.href = response.data.url;
        return;
      }

      dispatch(throwError(response?.message || t("subscription.errorStart")));
    } catch (error) {
      dispatch(throwError(t("subscription.errorStart")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pricing-wrapper">
      <div className="background-animation">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="container">
        <div className="pricing-card">
          <div className="pricing-topbar">
            <GoogleTranslate />
            <button
              type="button"
              className="logout-button"
              onClick={() => dispatch(handelLogout())}
            >
              {t("header.logout")}
            </button>
          </div>
          <div className="pricing-header">
            <h1>{t("subscription.title")}</h1>
            <p>{t("subscription.subtitle")}</p>
          </div>

          <div className="pricing-plan">
            <div className="plan-title">{t("subscription.planName")}</div>
            <div className="plan-billing">{t("subscription.planBilling")}</div>
            <p className="plan-description">{t("subscription.description")}</p>

            <div className="plan-meta">
              <div>
                <span>{t("subscription.nameLabel")}</span>
                <strong>{t("subscription.planName")}</strong>
              </div>
              <div>
                <span>{t("subscription.priceLabel")}</span>
                <strong>{t("subscription.priceValue")}</strong>
              </div>
              <div>
                <span>{t("subscription.billingLabel")}</span>
                <strong>{t("subscription.billingValue")}</strong>
              </div>
              <div>
                <span>{t("subscription.currencyLabel")}</span>
                <strong>{t("subscription.currencyValue")}</strong>
              </div>
              <div>
                <span>{t("subscription.trialLabel")}</span>
                <strong>{t("subscription.trialValue")}</strong>
              </div>
            </div>

            <ul className="plan-features">
              <li>
                <FiCheckCircle /> {t("subscription.feature1")}
              </li>
              <li>
                <FiCheckCircle /> {t("subscription.feature2")}
              </li>
              <li>
                <FiCheckCircle /> {t("subscription.feature3")}
              </li>
              <li>
                <FiCheckCircle /> {t("subscription.feature4")}
              </li>
            </ul>

            <button
              type="button"
              className="btn1 btn-submit"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? t("subscription.loading") : t("subscription.cta")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
