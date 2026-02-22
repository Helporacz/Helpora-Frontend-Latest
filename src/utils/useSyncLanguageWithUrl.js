import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, normalizeLanguage } from "@/lib/i18n-client";

const useSyncLanguageWithUrl = (defaultLang = DEFAULT_LANGUAGE) => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const pathLang = normalizeLanguage(location.pathname.split("/")[1] || "");
    const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language || "");

    if (SUPPORTED_LANGUAGES.includes(pathLang)) {
      if (currentLang !== pathLang) {
        i18n.changeLanguage(pathLang);
      }
    } else {
      if (currentLang !== defaultLang) {
        i18n.changeLanguage(defaultLang);
      }
    }
  }, [defaultLang, i18n, location.pathname]);
};

export default useSyncLanguageWithUrl;
