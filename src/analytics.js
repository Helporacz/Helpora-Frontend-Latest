import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-GTT8ZGCZ75"; // your GA4 ID

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};
