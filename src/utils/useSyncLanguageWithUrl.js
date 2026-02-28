import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  getStoredLanguage,
  persistLanguage,
} from "@/lib/i18n-client";
import { getLocalizedPath } from "utils/localizedRoute";

const useSyncLanguageWithUrl = (defaultLang = DEFAULT_LANGUAGE) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    const pathLang = normalizeLanguage(location.pathname.split("/")[1] || "");
    const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language || "");
    const storedLang = normalizeLanguage(getStoredLanguage(defaultLang));

    if (SUPPORTED_LANGUAGES.includes(pathLang)) {
      if (currentLang !== pathLang) {
        i18n.changeLanguage(pathLang);
      }
      if (storedLang !== pathLang) {
        persistLanguage(pathLang);
      }
    } else {
      const targetLang = SUPPORTED_LANGUAGES.includes(storedLang)
        ? storedLang
        : defaultLang;

      if (currentLang !== targetLang) {
        i18n.changeLanguage(targetLang);
      }
      persistLanguage(targetLang);

      const targetPathname = getLocalizedPath(
        location.pathname || "/",
        targetLang,
        defaultLang
      );

      if (targetPathname !== location.pathname) {
        navigate(`${targetPathname}${location.search}${location.hash}`, {
          replace: true,
        });
      }
    }
  }, [defaultLang, i18n, location.hash, location.pathname, location.search, navigate]);
};

export default useSyncLanguageWithUrl;
