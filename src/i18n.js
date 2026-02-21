import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import csTranslation from "./locales/cs/translation.json";

const getInitialLanguage = () => {
  if (typeof window !== "undefined") {
    const pathLang = window.location.pathname.split("/")[1];
    if (["en", "cz"].includes(pathLang)) {
      return pathLang;
    }
  }
  return "cz";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    cz: { translation: csTranslation },
  },
  lng: getInitialLanguage(),
  fallbackLng: "cz",
  interpolation: { escapeValue: false },
});

export default i18n;
