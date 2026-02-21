export const getLocalizedPath = (path, lang, defaultLang = "cz") => {
  if (!path) return "/";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLang) return cleanPath;
  return `/${lang}${cleanPath}`;
};
