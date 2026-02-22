import { useMemo, useState } from "react";
import "./PublicAds.scss";

const DEFAULT_SIDEBAR_CARD_WIDTH = 300;
const DEFAULT_SIDEBAR_CARD_HEIGHT = 450;
const DEFAULT_STICKY_OFFSET = 96;
const normalizeDimensionValue = (value) => {
  const parsed = Math.round(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizeHttpLink = (value = "") => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawValue);
  const withScheme = hasScheme ? rawValue : `https://${rawValue}`;

  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch (error) {
    return "";
  }
};

const PublicSideRailAds = ({
  ads = [],
  autoplaySeconds = 5,
  stickyOffset = DEFAULT_STICKY_OFFSET,
  dimensions = {},
}) => {
  void autoplaySeconds;
  const [brokenAdIds, setBrokenAdIds] = useState([]);
  const cardWidth =
    normalizeDimensionValue(dimensions?.width) || DEFAULT_SIDEBAR_CARD_WIDTH;
  const cardHeight =
    normalizeDimensionValue(dimensions?.height) || DEFAULT_SIDEBAR_CARD_HEIGHT;

  const brokenIdSet = useMemo(() => new Set(brokenAdIds), [brokenAdIds]);
  const sanitizedAds = useMemo(
    () =>
      (Array.isArray(ads) ? ads : [])
        .filter((ad) => ad?.isActive !== false && String(ad?.imageUrl || "").trim())
        .filter((ad) => !brokenIdSet.has(String(ad?.id || ad?.imageUrl || "")))
        .sort((leftItem, rightItem) => (leftItem?.order || 0) - (rightItem?.order || 0)),
    [ads, brokenIdSet]
  );

  const handleImageError = (adId, imageUrl) => {
    const fallbackId = String(adId || imageUrl || "");
    if (!fallbackId) return;

    setBrokenAdIds((prevIds) => {
      if (prevIds.includes(fallbackId)) return prevIds;
      return [...prevIds, fallbackId];
    });
  };

  if (!sanitizedAds.length) return null;

  const railStyle = {
    top: `${stickyOffset}px`,
    "--public-side-rail-card-width": `${cardWidth}px`,
    "--public-side-rail-card-height": `${cardHeight}px`,
  };

  return (
    <div
      className="public-side-rail-container"
      style={railStyle}
      aria-label="Sidebar advertisements"
    >
      <div className="public-side-rail-list">
        {sanitizedAds.map((ad, index) => {
          const key = `${ad?.id || ad?.imageUrl || "ad"}-${index}`;
          const normalizedLinkUrl = normalizeHttpLink(ad?.linkUrl);
          const isClickable = !!normalizedLinkUrl;
          const image = (
            <img
              src={ad.imageUrl}
              alt=""
              loading="lazy"
              onError={() => handleImageError(ad?.id, ad?.imageUrl)}
            />
          );

          return (
            <article
              key={key}
              className={`public-side-rail-card ${isClickable ? "is-clickable" : ""}`}
            >
              {isClickable ? (
                <a href={normalizedLinkUrl} target="_blank" rel="noopener noreferrer">
                  {image}
                </a>
              ) : (
                image
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default PublicSideRailAds;
