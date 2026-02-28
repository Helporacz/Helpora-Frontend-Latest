import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const DEFAULT_LANGUAGE = "cz";
const SUPPORTED_LANGUAGES = ["en", "cz", "ru"];
const PRIMARY_LANGUAGE_STORAGE_KEY = "helporaLng";
const LEGACY_LANGUAGE_STORAGE_KEY = "i18nextLng";
const LANGUAGE_ALIASES = {
  cs: "cz",
};

const normalizeLanguage = (language = "") => {
  const baseLanguage = language.toLowerCase().split(/[-_]/)[0];
  return LANGUAGE_ALIASES[baseLanguage] || baseLanguage;
};

const readStoredLanguage = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const storageKeys = [PRIMARY_LANGUAGE_STORAGE_KEY, LEGACY_LANGUAGE_STORAGE_KEY];
  for (const storageKey of storageKeys) {
    const normalized = normalizeLanguage(window.localStorage.getItem(storageKey) || "");
    if (SUPPORTED_LANGUAGES.includes(normalized)) {
      return normalized;
    }
  }

  return "";
};

const persistLanguage = (language) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeLanguage(language);
  if (!SUPPORTED_LANGUAGES.includes(normalized)) {
    return;
  }

  window.localStorage.setItem(PRIMARY_LANGUAGE_STORAGE_KEY, normalized);
  window.localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, normalized);
};

const getStoredLanguage = (fallbackLanguage = DEFAULT_LANGUAGE) =>
  readStoredLanguage() || fallbackLanguage;

const localeModules = import.meta.glob("../locales/*/*.json", {
  eager: true,
});

const resourcesByLanguage = Object.entries(localeModules).reduce((acc, [filePath, module]) => {
  const match = filePath.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) {
    return acc;
  }

  const [, folderLanguage, fileName] = match;
  const languageFromPath = normalizeLanguage(folderLanguage);
  const normalizedFileName = fileName.toLowerCase();
  const filePriority = normalizedFileName === "translation" ? 2 : normalizedFileName === folderLanguage.toLowerCase() ? 1 : 0;
  const translationData = module.default ?? module;

  if (!acc[languageFromPath] || filePriority >= acc[languageFromPath].priority) {
    acc[languageFromPath] = {
      priority: filePriority,
      translation: translationData,
    };
  }

  return acc;
}, {});

const resources = Object.entries(resourcesByLanguage).reduce((acc, [language, value]) => {
  acc[language] = {
    translation: value.translation,
  };
  return acc;
}, {});

if (resources.cz && !resources.cs) {
  resources.cs = resources.cz;
}

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const pathLanguage = normalizeLanguage(window.location.pathname.split("/")[1] || "");
  if (SUPPORTED_LANGUAGES.includes(pathLanguage)) {
    return pathLanguage;
  }

  const storedLanguage = readStoredLanguage();
  if (storedLanguage) {
    return storedLanguage;
  }

  return DEFAULT_LANGUAGE;
};

const syncHtmlLanguage = (language) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = language === "cz" ? "cs" : language;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ["path", "localStorage", "navigator", "htmlTag"],
      lookupFromPathIndex: 0,
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
      convertDetectedLanguage: (language) => normalizeLanguage(language),
    },
  });

i18n.on("languageChanged", (language) => {
  const normalizedLanguage = normalizeLanguage(language);

  if (normalizedLanguage !== language && SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
    i18n.changeLanguage(normalizedLanguage);
    return;
  }

  if (SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
    persistLanguage(normalizedLanguage);
    syncHtmlLanguage(normalizedLanguage);
  }
});

const initialNormalizedLanguage = normalizeLanguage(i18n.language || DEFAULT_LANGUAGE);
persistLanguage(initialNormalizedLanguage);
syncHtmlLanguage(initialNormalizedLanguage);

export {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  PRIMARY_LANGUAGE_STORAGE_KEY,
  LEGACY_LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  persistLanguage,
  getStoredLanguage,
};
export default i18n;
