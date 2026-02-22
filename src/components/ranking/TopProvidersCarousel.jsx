import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getLocalizedPath } from "utils/localizedRoute";
import { localizeRankBadgeLabel } from "utils/rankingLabel";
import "./TopProvidersCarousel.scss";

const normalizeRating = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(5, parsed);
};

const renderStarRow = (ratingValue) => {
  const rating = normalizeRating(ratingValue);
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }).map((_, index) => {
    const isActive = index < rounded;
    return (
      <FaStar
        key={`star-${index}`}
        className={`top-providers-star ${isActive ? "is-active" : ""}`}
      />
    );
  });
};

const TopProviderMarqueeText = ({ text, className = "", title }) => {
  const wrapperRef = useRef(null);
  const textRef = useRef(null);
  const [marqueeState, setMarqueeState] = useState({
    animated: false,
    distance: 0,
    duration: 0,
  });

  useEffect(() => {
    let frameId = 0;
    let resizeObserver = null;

    const measure = () => {
      const wrapper = wrapperRef.current;
      const inner = textRef.current;
      if (!wrapper || !inner) return;

      const overflowWidth = Math.max(
        0,
        Math.ceil(inner.scrollWidth - wrapper.clientWidth)
      );
      if (overflowWidth > 2) {
        const distance = overflowWidth + 20;
        const duration = Math.max(6, Math.min(18, distance / 28));

        setMarqueeState((previous) => {
          if (
            previous.animated &&
            previous.distance === distance &&
            previous.duration === duration
          ) {
            return previous;
          }
          return {
            animated: true,
            distance,
            duration,
          };
        });
        return;
      }

      setMarqueeState((previous) =>
        previous.animated
          ? { animated: false, distance: 0, duration: 0 }
          : previous
      );
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleMeasure);
      if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
      if (textRef.current) resizeObserver.observe(textRef.current);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleMeasure);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [text]);

  return (
    <span
      ref={wrapperRef}
      className={`top-provider-marquee-slot ${
        marqueeState.animated ? "is-animated" : "is-static"
      } ${className}`.trim()}
      title={title || text || ""}
    >
      <span
        ref={textRef}
        className={`top-provider-marquee-text ${
          marqueeState.animated ? "is-animated" : ""
        }`}
        style={
          marqueeState.animated
            ? {
                "--marquee-distance": `${marqueeState.distance}px`,
                "--marquee-duration": `${marqueeState.duration}s`,
              }
            : undefined
        }
      >
        {text || "-"}
      </span>
    </span>
  );
};

const TopProvidersCarousel = ({
  providers = [],
  loading = false,
  className = "",
  showEmptyState = false,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const normalizedProviders = useMemo(
    () =>
      (Array.isArray(providers) ? providers : [])
        .filter((provider) => provider && provider._id)
        .sort((left, right) => {
          const leftRank = Number(left?.ranking_position) || Number.MAX_SAFE_INTEGER;
          const rightRank = Number(right?.ranking_position) || Number.MAX_SAFE_INTEGER;
          return leftRank - rightRank;
        }),
    [providers]
  );

  if (!loading && normalizedProviders.length === 0 && !showEmptyState) {
    return null;
  }

  const wrapperClasses = ["top-providers-section", className]
    .filter(Boolean)
    .join(" ");

  const slideCards = loading
    ? Array.from({ length: 5 }).map((_, index) => ({
        _id: `loading-${index}`,
        loading: true,
      }))
    : normalizedProviders;

  return (
    <section style={{
      margin:"10px"
    }} className={wrapperClasses}>
      <div className="top-providers-head">
        <h2 className="top-providers-title">{t("topProviders.title")}</h2>
        
      </div>

      {slideCards.length === 0 ? (
        <div className="top-providers-empty">{t("topProviders.noProviders")}</div>
      ) : (
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          className="top-providers-swiper"
          slidesPerView={1.1}
          spaceBetween={14}
          navigation
          pagination={{ clickable: true }}
          autoplay={
            !loading && normalizedProviders.length > 4
              ? { delay: 5000, disableOnInteraction: false }
              : false
          }
          breakpoints={{
            576: { slidesPerView: 2, spaceBetween: 14 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            992: { slidesPerView: 4, spaceBetween: 16 },
            1320: { slidesPerView: 5, spaceBetween: 16 },
          }}
        >
          {slideCards.map((provider) => {
            const rankingPosition = Number(provider?.ranking_position) || null;
            const providerName = provider?.name || "-";
            const categoryLabel =
              provider?.category || t("topProviders.categoryUnavailable");
            const ratingValue = normalizeRating(provider?.averageRating);
            const reviewCount = Number(provider?.totalReviews) || 0;
            const isFeatured =
              !!provider?.rank_badge_label ||
              (Number.isInteger(rankingPosition) && rankingPosition <= 2);
            const featuredLabel = localizeRankBadgeLabel(
              provider?.rank_badge_label,
              t,
              t("topProviders.featuredRibbon")
            );

            const onCardClick = () => {
              if (!provider?._id || provider?.loading) return;
              navigate(
                getLocalizedPath(`/showprofile/${provider._id}`, i18n.language)
              );
            };

            return (
              <SwiperSlide key={provider._id}>
                <article
                  className={`top-provider-card ${provider?.loading ? "is-loading" : ""}`}
                  onClick={onCardClick}
                  role="button"
                  tabIndex={provider?.loading ? -1 : 0}
                  onKeyDown={(event) => {
                    if (provider?.loading) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onCardClick();
                    }
                  }}
                >
                  {isFeatured && !provider?.loading && (
                    <div className="top-provider-ribbon">
                      <TopProviderMarqueeText
                        text={featuredLabel}
                        className="is-ribbon"
                      />
                    </div>
                  )}

                  <div className="top-provider-rank">
                    {rankingPosition ? `#${rankingPosition}` : "#-"}
                  </div>

                  <div className="top-provider-logo-wrap">
                    {provider?.profileImage ? (
                      <img
                        src={provider.profileImage}
                        alt={providerName}
                        className="top-provider-logo"
                        loading="lazy"
                      />
                    ) : (
                      <div className="top-provider-logo-fallback">
                        {providerName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="top-provider-name">
                    <TopProviderMarqueeText
                      text={providerName}
                      className="is-name"
                    />
                  </h3>

                  <div className="top-provider-stars">
                    {renderStarRow(ratingValue)}
                    {!provider?.loading && ratingValue > 0 && (
                      <span className="top-provider-rating-value">{ratingValue.toFixed(1)}</span>
                    )}
                  </div>

                  <p className="top-provider-category">
                    <TopProviderMarqueeText
                      text={categoryLabel}
                      className="is-category"
                    />
                  </p>

                  {!provider?.loading && (
                    <p className="top-provider-reviews">
                      <TopProviderMarqueeText
                        text={t("topProviders.reviews", { count: reviewCount })}
                        className="is-reviews"
                      />
                    </p>
                  )}
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </section>
  );
};

export default TopProvidersCarousel;
