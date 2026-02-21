import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "store";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

// --- Google Analytics 4 setup ---
import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-GTT8ZGCZ75"; // Replace with your GA4 Measurement ID
ReactGA.initialize(GA_MEASUREMENT_ID);

// Log the first page view
ReactGA.send({ hitType: "pageview", page: window.location.pathname });

// Optionally log route changes if you have a router
// You can call this in your App component whenever route changes
export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

// --- Render App ---
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </Provider>
);

// Measure performance
reportWebVitals();
