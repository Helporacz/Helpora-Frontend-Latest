import { useEffect, useMemo, useRef, useState } from "react";
import "./PublicAds.scss";

const DEFAULT_AUTOPLAY_SECONDS = 5;
const MARQUEE_MIN_DURATION_SECONDS = 4;
const MARQUEE_MAX_DURATION_SECONDS = 24;
const MARQUEE_PIXELS_PER_SECOND = 70;
const MARQUEE_FALLBACK_TRAVEL_PX = 24;

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);
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

const TopBannerMarquee = ({ text = "", isActive = false }) => {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [travelPx, setTravelPx] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!viewportRef.current || !trackRef.current) return undefined;

    const viewportElement = viewportRef.current;
    const trackElement = trackRef.current;

    const recalculateOverflow = () => {
      const viewportWidth = viewportElement.clientWidth || 0;
      const trackWidth = trackElement.scrollWidth || 0;
      const overflowPx = Math.max(0, Math.ceil(trackWidth - viewportWidth));
      const availableSpacePx = Math.max(0, Math.ceil(viewportWidth - trackWidth));

      let nextTravelPx = 0;
      if (overflowPx > 0) {
        nextTravelPx = -overflowPx;
      } else if (availableSpacePx > 0) {
        nextTravelPx = availableSpacePx;
      } else {
        nextTravelPx = MARQUEE_FALLBACK_TRAVEL_PX;
      }

      setTravelPx(nextTravelPx);
    };

    recalculateOverflow();

    let resizeObserver = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => recalculateOverflow());
      resizeObserver.observe(viewportElement);
      resizeObserver.observe(trackElement);
    }

    window.addEventListener("resize", recalculateOverflow);
    return () => {
      window.removeEventListener("resize", recalculateOverflow);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [text]);

  const durationSeconds = useMemo(() => {
    const distancePx = Math.abs(Number(travelPx) || 0);
    if (!distancePx) return MARQUEE_MIN_DURATION_SECONDS;
    return clampNumber(
      distancePx / MARQUEE_PIXELS_PER_SECOND,
      MARQUEE_MIN_DURATION_SECONDS,
      MARQUEE_MAX_DURATION_SECONDS
    );
  }, [travelPx]);

  const shouldAnimate = isActive;

  return (
    <div className="public-top-banner-marquee" aria-hidden="true">
      <div className="public-top-banner-marquee-viewport" ref={viewportRef}>
        <div
          ref={trackRef}
          className={`public-top-banner-marquee-track ${
            shouldAnimate ? "is-animated" : "is-static"
          }`}
          style={{
            "--marquee-travel": `${travelPx}px`,
            "--marquee-duration": `${durationSeconds}s`,
          }}
        >
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
};

const PublicTopBannerAds = ({
  ads = [],
  autoplaySeconds = DEFAULT_AUTOPLAY_SECONDS,
  dimensions = {},
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenAdIds, setBrokenAdIds] = useState([]);
  const customWidth = normalizeDimensionValue(dimensions?.width);
  const customHeight = normalizeDimensionValue(dimensions?.height);
  const frameStyle =
    customWidth && customHeight
      ? {
          "--public-top-banner-aspect-ratio": `${customWidth} / ${customHeight}`,
        }
      : undefined;

  const brokenIdSet = useMemo(() => new Set(brokenAdIds), [brokenAdIds]);
  const sanitizedAds = useMemo(
    () =>
      (Array.isArray(ads) ? ads : [])
        .filter((ad) => ad?.isActive !== false && String(ad?.imageUrl || "").trim())
        .filter((ad) => !brokenIdSet.has(String(ad?.id || ad?.imageUrl || "")))
        .sort((leftItem, rightItem) => (leftItem?.order || 0) - (rightItem?.order || 0)),
    [ads, brokenIdSet]
  );

  useEffect(() => {
    if (activeIndex < sanitizedAds.length) return;
    setActiveIndex(0);
  }, [activeIndex, sanitizedAds.length]);

  useEffect(() => {
    if (sanitizedAds.length <= 1) return undefined;

    const intervalSeconds = Number.isFinite(Number(autoplaySeconds))
      ? Number(autoplaySeconds)
      : DEFAULT_AUTOPLAY_SECONDS;
    const intervalMs = Math.max(1000, intervalSeconds * 1000);

    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % sanitizedAds.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoplaySeconds, sanitizedAds.length]);

  const handleImageError = (adId, imageUrl) => {
    const fallbackId = String(adId || imageUrl || "");
    if (!fallbackId) return;

    setBrokenAdIds((prevIds) => {
      if (prevIds.includes(fallbackId)) return prevIds;
      return [...prevIds, fallbackId];
    });
  };

  if (!sanitizedAds.length) return null;

  return (
    <section className="public-top-banner-wrap" aria-label="Top banner advertisements">
      <div className="public-top-banner-frame" style={frameStyle}>
        {sanitizedAds.map((ad, index) => {
          const key = String(ad?.id || ad?.imageUrl || index);
          const isActive = index === activeIndex;
          const normalizedLinkUrl = normalizeHttpLink(ad?.linkUrl);
          const isClickable = !!normalizedLinkUrl;
          const marqueeText = String(ad?.marqueeText || "").trim();
          const image = (
            <img
              src={ad.imageUrl}
              alt=""
              loading={isActive ? "eager" : "lazy"}
              onError={() => handleImageError(ad?.id, ad?.imageUrl)}
            />
          );

          return (
            <div
              key={key}
              className={`public-top-banner-slide ${isActive ? "is-active" : ""} ${isClickable ? "is-clickable" : ""}`}
              aria-hidden={!isActive}
            >
              {isClickable ? (
                <a href={normalizedLinkUrl} target="_blank" rel="noopener noreferrer">
                  {image}
                </a>
              ) : (
                image
              )}
              {marqueeText ? <TopBannerMarquee text={marqueeText} isActive={isActive} /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PublicTopBannerAds;
