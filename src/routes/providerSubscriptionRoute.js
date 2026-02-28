import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Pricing from "pages/Subscription/Pricing";
import SubscriptionSuccess from "pages/Subscription/SubscriptionSuccess";
import Terms from "pages/Terms/Terms";
import MainLayout from "pages/MainLayout/MainLayout";
import ScrollToTop from "components/layouts/ScrollToTop/ScrollToTop";
import { commonRoute } from "utils/constants";
import { getLocalizedPath } from "utils/localizedRoute";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  getStoredLanguage,
} from "@/lib/i18n-client";

const ProviderSubscriptionRoute = () => {
  const languages = SUPPORTED_LANGUAGES;
  const defaultLang = DEFAULT_LANGUAGE;

  const PricingRedirect = () => {
    const { pathname } = useLocation();
    const pathLang = normalizeLanguage(pathname.split("/")[1] || "");
    const storedLang = getStoredLanguage(defaultLang);
    const targetLang = languages.includes(pathLang)
      ? pathLang
      : languages.includes(storedLang)
      ? storedLang
      : defaultLang;
    return (
      <Navigate
        to={getLocalizedPath(commonRoute.pricing, targetLang, defaultLang)}
        replace
      />
    );
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {languages.map((lang) => (
          <Route
            key={`pricing-${lang}`}
            path={getLocalizedPath(commonRoute.pricing, lang)}
            element={<Pricing />}
          />
        ))}

        {languages.map((lang) => (
          <Route
            key={`success-${lang}`}
            path={getLocalizedPath(commonRoute.subscriptionSuccess, lang)}
            element={<SubscriptionSuccess />}
          />
        ))}

        {languages.map((lang) => (
          <Route
            key={`terms-${lang}`}
            path={getLocalizedPath(commonRoute.terms, lang)}
            element={<MainLayout />}
          >
            <Route index element={<Terms />} />
          </Route>
        ))}

        <Route
          path="*"
          element={<PricingRedirect />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default ProviderSubscriptionRoute;
