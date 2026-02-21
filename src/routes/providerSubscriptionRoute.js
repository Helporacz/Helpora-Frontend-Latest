import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Pricing from "pages/Subscription/Pricing";
import SubscriptionSuccess from "pages/Subscription/SubscriptionSuccess";
import Terms from "pages/Terms/Terms";
import MainLayout from "pages/MainLayout/MainLayout";
import { commonRoute } from "utils/constants";
import { getLocalizedPath } from "utils/localizedRoute";

const ProviderSubscriptionRoute = () => {
  const languages = ["en", "cz"];
  const defaultLang = "cz";

  const PricingRedirect = () => {
    const { pathname } = useLocation();
    const lang = pathname.split("/")[1];
    const targetLang = languages.includes(lang) && lang !== defaultLang ? lang : defaultLang;
    return (
      <Navigate
        to={getLocalizedPath(commonRoute.pricing, targetLang)}
        replace
      />
    );
  };

  return (
    <BrowserRouter>
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
