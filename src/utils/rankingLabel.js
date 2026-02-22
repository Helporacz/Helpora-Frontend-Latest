const normalizeRankBadge = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const LABEL_KEY_BY_VALUE = {
  "featured": "topProviders.featuredRibbon",
  "featured provider": "topProviders.featuredRibbon",
  "ranked provider": "search.rankedProvider",
  "best service provider": "topProviders.bestServiceProvider",

  "doporučeno": "topProviders.featuredRibbon",
  "doporučený poskytovatel": "search.rankedProvider",
  "nejlepší poskytovatel služeb": "topProviders.bestServiceProvider",

  "рекомендовано": "topProviders.featuredRibbon",
  "рекомендуемый поставщик": "search.rankedProvider",
  "лучший поставщик услуг": "topProviders.bestServiceProvider",
};

export const localizeRankBadgeLabel = (label, t, fallback = "") => {
  const normalized = normalizeRankBadge(label);
  if (!normalized) return fallback;

  const translationKey = LABEL_KEY_BY_VALUE[normalized];
  if (!translationKey) {
    return String(label).trim();
  }

  return t(translationKey, fallback || String(label).trim());
};

