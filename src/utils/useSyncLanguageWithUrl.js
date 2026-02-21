import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const useSyncLanguageWithUrl = (defaultLang = "cz") => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const pathLang = location.pathname.split("/")[1];

    if (["en", "cz"].includes(pathLang)) {
      if (i18n.language !== pathLang) {
        i18n.changeLanguage(pathLang);
      }
    } else {
      if (i18n.language !== defaultLang) {
        i18n.changeLanguage(defaultLang);
      }
    }
  }, [location.pathname]);
};

export default useSyncLanguageWithUrl;
