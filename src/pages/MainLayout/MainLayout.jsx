import PublicSideRailAds from "components/ads/PublicSideRailAds";
import PublicTopBannerAds from "components/ads/PublicTopBannerAds";
import "components/ads/PublicAds.scss";
import Footer from "components/Footer/Footer";
import Navbars from "pages/Homepage/Navbar/Navbars";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { getPublicAdsConfig } from "store/globalSlice";
import useSyncLanguageWithUrl from "utils/useSyncLanguageWithUrl";

const DEFAULT_SIDEBAR_WIDTH = 300;

const normalizeDimensionValue = (value) => {
  const parsed = Math.round(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizeDimensions = (source = {}) => {
  const nextSource =
    source && typeof source === "object" && !Array.isArray(source) ? source : {};
  const top =
    nextSource.top && typeof nextSource.top === "object" ? nextSource.top : {};
  const sidebar =
    nextSource.sidebar && typeof nextSource.sidebar === "object"
      ? nextSource.sidebar
      : {};

  return {
    top: {
      width: normalizeDimensionValue(top.width),
      height: normalizeDimensionValue(top.height),
    },
    sidebar: {
      width: normalizeDimensionValue(sidebar.width),
      height: normalizeDimensionValue(sidebar.height),
    },
  };
};

const MainLayout = () => {
  const dispatch = useDispatch();
  const [publicAds, setPublicAds] = useState({
    top: [],
    sidebar: [],
    autoplaySeconds: 5,
    dimensions: {
      top: {
        width: null,
        height: null,
      },
      sidebar: {
        width: null,
        height: null,
      },
    },
  });

  const userRole = String(localStorage.getItem("userRole") || "").toLowerCase();
  const shouldShowPublicAds = userRole !== "provider" && userRole !== "superadmin";

  useEffect(() => {
    let isMounted = true;

    const fetchPublicAds = async () => {
      if (!shouldShowPublicAds) return;
      const response = await dispatch(getPublicAdsConfig());

      if (!isMounted) return;
      if (response?.success && response?.data) {
        setPublicAds({
          top: Array.isArray(response.data.top) ? response.data.top : [],
          sidebar: Array.isArray(response.data.sidebar) ? response.data.sidebar : [],
          autoplaySeconds: Number(response.data.autoplaySeconds) || 5,
          dimensions: normalizeDimensions(response.data.dimensions || {}),
        });
        return;
      }

      setPublicAds({
        top: [],
        sidebar: [],
        autoplaySeconds: 5,
        dimensions: normalizeDimensions({}),
      });
    };

    fetchPublicAds();
    return () => {
      isMounted = false;
    };
  }, [dispatch, shouldShowPublicAds]);

  const topAds = useMemo(() => publicAds.top || [], [publicAds.top]);
  const sidebarAds = useMemo(() => publicAds.sidebar || [], [publicAds.sidebar]);
  const hasTopAds = shouldShowPublicAds && topAds.length > 0;
  const hasSidebarAds = shouldShowPublicAds && sidebarAds.length > 0;
  const sidebarRailWidth =
    Number(publicAds.dimensions?.sidebar?.width) > 0
      ? Number(publicAds.dimensions.sidebar.width)
      : DEFAULT_SIDEBAR_WIDTH;
  const publicLayoutShellStyle = hasSidebarAds
    ? { "--public-side-rail-width": `${sidebarRailWidth}px` }
    : undefined;

  useSyncLanguageWithUrl("cz");
  return (
    <>
      {hasTopAds && (
        <PublicTopBannerAds
          ads={topAds}
          autoplaySeconds={publicAds.autoplaySeconds}
          dimensions={publicAds.dimensions?.top}
        />
      )}
      <Navbars />
      <main className="public-main">
        {hasSidebarAds ? (
          <div className="public-layout-shell" style={publicLayoutShellStyle}>
            <div className="public-layout-content">
              <Outlet />
            </div>
            <aside className="public-layout-side">
              <PublicSideRailAds
                ads={sidebarAds}
                autoplaySeconds={publicAds.autoplaySeconds}
                dimensions={publicAds.dimensions?.sidebar}
              />
            </aside>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
