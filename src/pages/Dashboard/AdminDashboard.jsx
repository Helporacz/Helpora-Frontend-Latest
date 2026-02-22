import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card, Table, Form } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FaUsers, FaBox, FaShoppingCart } from "react-icons/fa";
import {
  getAdminOrdersList,
  getAdminEarningsOverview,
  getProviderVerificationStatus,
  getAllProviders,
  getAdminSummary,
  getAdminAppAccessSetting,
  getAdminPublicAdsConfig,
  updateAdminPublicAdsConfig,
  uploadImage,
  updateAdminAppAccessSetting,
  throwError,
  throwSuccess,
} from "store/globalSlice";
import DateFilter from "components/Dashboard/DateFilter";
import ProviderFilter from "components/Dashboard/ProviderFilter";
import "./AdminDashboard.scss";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PUBLIC_AD_SLOT = {
  top: "top",
  sidebar: "sidebar",
};

const MAX_PUBLIC_ADS_PER_SLOT = 20;
const DEFAULT_PUBLIC_AD_DIMENSIONS = {
  top: {
    width: 1536,
    height: 230,
  },
  sidebar: {
    width: 300,
    height: 450,
  },
};
const PUBLIC_AD_DIMENSION_LIMITS = {
  top: {
    width: { min: 900, max: 2200 },
    height: { min: 100, max: 420 },
  },
  sidebar: {
    width: { min: 220, max: 520 },
    height: { min: 300, max: 900 },
  },
};

const createClientAdId = () =>
  `ad_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const normalizeAdOrder = (items = []) =>
  (Array.isArray(items) ? items : []).map((item, index) => ({
    ...item,
    order: index + 1,
  }));

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

const normalizeDimensionValue = (value) => {
  const parsed = Math.round(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizeDimensionsState = (rawDimensions = {}) => {
  const source =
    rawDimensions && typeof rawDimensions === "object" && !Array.isArray(rawDimensions)
      ? rawDimensions
      : {};
  const top = source.top && typeof source.top === "object" ? source.top : {};
  const sidebar =
    source.sidebar && typeof source.sidebar === "object" ? source.sidebar : {};

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

const getResolvedDimensions = (dimensions = {}) => {
  const normalized = normalizeDimensionsState(dimensions);
  return {
    top: {
      width: normalized.top.width || DEFAULT_PUBLIC_AD_DIMENSIONS.top.width,
      height: normalized.top.height || DEFAULT_PUBLIC_AD_DIMENSIONS.top.height,
    },
    sidebar: {
      width: normalized.sidebar.width || DEFAULT_PUBLIC_AD_DIMENSIONS.sidebar.width,
      height: normalized.sidebar.height || DEFAULT_PUBLIC_AD_DIMENSIONS.sidebar.height,
    },
  };
};

const AdminDashboard = ({ view = "default" }) => {
  const isPublicAdsView = view === "publicAds";
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [ordersList, setOrdersList] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [appAccessSetting, setAppAccessSetting] = useState({
    loading: true,
    saving: false,
    requireProviderSubscription: true,
    updatedAt: null,
    updatedBy: null,
  });
  const [publicAdsConfig, setPublicAdsConfig] = useState({
    loading: true,
    saving: false,
    uploadingSlot: null,
    top: [],
    sidebar: [],
    autoplaySeconds: 5,
    dimensions: normalizeDimensionsState({}),
  });
  const [dragItem, setDragItem] = useState({ slot: null, id: null });
  const [linkValidationErrors, setLinkValidationErrors] = useState({});
  const [ordersDateFilter, setOrdersDateFilter] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return {
      dateFilter: "thisMonth",
      startDate: start,
      endDate: end,
    };
  });
  const [earningsDateFilter, setEarningsDateFilter] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return {
      dateFilter: "thisMonth",
      startDate: start,
      endDate: end,
    };
  });
  const [verificationDateFilter, setVerificationDateFilter] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return {
      dateFilter: "thisMonth",
      startDate: start,
      endDate: end,
    };
  });

  const fetchProviders = useCallback(async () => {
    try {
      const res = await dispatch(getAllProviders());
      if (res?.success && res?.data) {
        const options = res.data.map((provider) => ({
          value: provider._id,
          label: `${provider.name} (${provider.email})`,
        }));
        setProviders([{ value: "", label: "All Providers" }, ...options]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  }, [dispatch]);

  const fetchSummary = useCallback(async () => {
    try {
      const params = selectedProvider?.value
        ? { providerId: selectedProvider.value }
        : {};
      const res = await dispatch(getAdminSummary(params));
      if (res?.success) {
        setSummaryData(res.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, [dispatch, selectedProvider?.value]);

  const fetchAppAccessSetting = useCallback(async () => {
    try {
      const res = await dispatch(getAdminAppAccessSetting());
      if (res?.success && res?.data) {
        setAppAccessSetting((prev) => ({
          ...prev,
          loading: false,
          saving: false,
          requireProviderSubscription: !!res.data.requireProviderSubscription,
          updatedAt: res.data.updatedAt || null,
          updatedBy: res.data.updatedBy || null,
        }));
      } else {
        setAppAccessSetting((prev) => ({ ...prev, loading: false, saving: false }));
      }
    } catch (error) {
      console.error("Error fetching app access setting:", error);
      setAppAccessSetting((prev) => ({ ...prev, loading: false, saving: false }));
    }
  }, [dispatch]);

  const mapPublicAdsResponse = useCallback((data = {}) => {
    const top = Array.isArray(data.top) ? data.top : [];
    const sidebar = Array.isArray(data.sidebar) ? data.sidebar : [];
    const autoplaySeconds = Number(data.autoplaySeconds) || 5;
    const dimensions = normalizeDimensionsState(data.dimensions || {});

    return {
      top: [...top].sort((leftItem, rightItem) => (leftItem?.order || 0) - (rightItem?.order || 0)),
      sidebar: [...sidebar].sort(
        (leftItem, rightItem) => (leftItem?.order || 0) - (rightItem?.order || 0)
      ),
      autoplaySeconds,
      dimensions,
    };
  }, []);

  const fetchPublicAdsConfig = useCallback(async () => {
    try {
      const res = await dispatch(getAdminPublicAdsConfig());
      if (res?.success && res?.data) {
        const mapped = mapPublicAdsResponse(res.data);
        setPublicAdsConfig((prev) => ({
          ...prev,
          loading: false,
          saving: false,
          uploadingSlot: null,
          ...mapped,
        }));
        return;
      }
      setPublicAdsConfig((prev) => ({
        ...prev,
        loading: false,
        saving: false,
        uploadingSlot: null,
        top: [],
        sidebar: [],
        autoplaySeconds: 5,
        dimensions: normalizeDimensionsState({}),
      }));
    } catch (error) {
      console.error("Error fetching public ads config:", error);
      setPublicAdsConfig((prev) => ({
        ...prev,
        loading: false,
        saving: false,
        uploadingSlot: null,
      }));
    }
  }, [dispatch, mapPublicAdsResponse]);

  const persistPublicAdsConfig = useCallback(
    async (nextConfig, options = {}) => {
      const { successMessage = "" } = options;
      setPublicAdsConfig((prev) => ({ ...prev, saving: true }));

      const payload = {
        top: normalizeAdOrder(nextConfig.top || []),
        sidebar: normalizeAdOrder(nextConfig.sidebar || []),
        autoplaySeconds: Number(nextConfig.autoplaySeconds) || 5,
        dimensions: normalizeDimensionsState(nextConfig.dimensions || {}),
      };

      const res = await dispatch(updateAdminPublicAdsConfig(payload));
      if (res?.success && res?.data) {
        const mapped = mapPublicAdsResponse(res.data);
        setPublicAdsConfig((prev) => ({
          ...prev,
          saving: false,
          ...mapped,
        }));
        if (successMessage) dispatch(throwSuccess(successMessage));
        return true;
      }

      setPublicAdsConfig((prev) => ({ ...prev, saving: false }));
      dispatch(throwError(res?.message || t("adminDashboard.publicAds.messages.saveFailed")));
      return false;
    },
    [dispatch, mapPublicAdsResponse, t]
  );

  const getCurrentPublicAdsSnapshot = useCallback(
    () => ({
      top: publicAdsConfig.top || [],
      sidebar: publicAdsConfig.sidebar || [],
      autoplaySeconds: publicAdsConfig.autoplaySeconds || 5,
      dimensions: normalizeDimensionsState(publicAdsConfig.dimensions || {}),
    }),
    [
      publicAdsConfig.autoplaySeconds,
      publicAdsConfig.dimensions,
      publicAdsConfig.sidebar,
      publicAdsConfig.top,
    ]
  );

  const fetchOrdersList = useCallback(async () => {
    try {
      const params = {
        dateFilter: ordersDateFilter.dateFilter,
        ...(ordersDateFilter.startDate && {
          startDate: ordersDateFilter.startDate.toISOString(),
        }),
        ...(ordersDateFilter.endDate && {
          endDate: ordersDateFilter.endDate.toISOString(),
        }),
        ...(selectedProvider?.value && { providerId: selectedProvider.value }),
        ...(selectedStatus && { status: selectedStatus }),
      };
      const res = await dispatch(getAdminOrdersList(params));
      if (res?.success) {
        setOrdersList(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders list:", error);
    }
  }, [
    dispatch,
    ordersDateFilter.dateFilter,
    ordersDateFilter.startDate?.getTime(),
    ordersDateFilter.endDate?.getTime(),
    selectedProvider?.value,
    selectedStatus,
  ]);

  const fetchEarningsOverview = useCallback(async () => {
    try {
      const params = {
        dateFilter: earningsDateFilter.dateFilter,
        ...(earningsDateFilter.startDate && {
          startDate: earningsDateFilter.startDate.toISOString(),
        }),
        ...(earningsDateFilter.endDate && {
          endDate: earningsDateFilter.endDate.toISOString(),
        }),
        ...(selectedProvider?.value && { providerId: selectedProvider.value }),
      };
      const res = await dispatch(getAdminEarningsOverview(params));
      if (res?.success) {
        setEarningsData(res.data);
      }
    } catch (error) {
      console.error("Error fetching earnings overview:", error);
    }
  }, [
    dispatch,
    earningsDateFilter.dateFilter,
    earningsDateFilter.startDate?.getTime(),
    earningsDateFilter.endDate?.getTime(),
    selectedProvider?.value,
  ]);

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const params = {
        dateFilter: verificationDateFilter.dateFilter,
        ...(verificationDateFilter.startDate && {
          startDate: verificationDateFilter.startDate.toISOString(),
        }),
        ...(verificationDateFilter.endDate && {
          endDate: verificationDateFilter.endDate.toISOString(),
        }),
      };
      const res = await dispatch(getProviderVerificationStatus(params));
      if (res?.success) {
        setVerificationData(res.data);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    }
  }, [
    dispatch,
    verificationDateFilter.dateFilter,
    verificationDateFilter.startDate?.getTime(),
    verificationDateFilter.endDate?.getTime(),
  ]);

  useEffect(() => {
    if (isPublicAdsView) return;
    fetchProviders();
  }, [fetchProviders, isPublicAdsView]);

  // Initial load - fetch all data except orders list
  useEffect(() => {
    setLoading(true);
    if (isPublicAdsView) {
      Promise.all([fetchPublicAdsConfig()]).finally(() => {
        setLoading(false);
      });
      return;
    }

    Promise.all([
      fetchSummary(),
      fetchEarningsOverview(),
      fetchVerificationStatus(),
      fetchAppAccessSetting(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [
    fetchSummary,
    fetchEarningsOverview,
    fetchVerificationStatus,
    fetchAppAccessSetting,
    fetchPublicAdsConfig,
    isPublicAdsView,
  ]);

  // Separate effect for Orders List - only runs when orders filters change
  useEffect(() => {
    if (isPublicAdsView) return;
    fetchOrdersList();
  }, [fetchOrdersList, isPublicAdsView]);

  const handleProviderChange = (selectedOption) => {
    setSelectedProvider(selectedOption);
  };

  const handleProviderSubscriptionToggle = async (event) => {
    const nextValue = event.target.checked;
    const previousValue = appAccessSetting.requireProviderSubscription;

    setAppAccessSetting((prev) => ({
      ...prev,
      saving: true,
      requireProviderSubscription: nextValue,
    }));

    try {
      const res = await dispatch(
        updateAdminAppAccessSetting({
          requireProviderSubscription: nextValue,
        })
      );

      if (res?.success && res?.data) {
        setAppAccessSetting((prev) => ({
          ...prev,
          saving: false,
          requireProviderSubscription: !!res.data.requireProviderSubscription,
          updatedAt: res.data.updatedAt || null,
          updatedBy: res.data.updatedBy || null,
        }));
        dispatch(
          throwSuccess(
            nextValue
              ? t("adminDashboard.appAccess.messages.enabledSuccess")
              : t("adminDashboard.appAccess.messages.disabledSuccess")
          )
        );
      } else {
        setAppAccessSetting((prev) => ({
          ...prev,
          saving: false,
          requireProviderSubscription: previousValue,
        }));
        dispatch(throwError(t("adminDashboard.appAccess.messages.updateFailed")));
      }
    } catch (error) {
      console.error("Error updating app access setting:", error);
      setAppAccessSetting((prev) => ({
        ...prev,
        saving: false,
        requireProviderSubscription: previousValue,
      }));
      dispatch(throwError(t("adminDashboard.appAccess.messages.updateFailed")));
    }
  };

  const handleUploadAds = async (slot, event) => {
    const selectedFiles = Array.from(event.target.files || []).filter((file) =>
      String(file?.type || "").startsWith("image/")
    );
    event.target.value = "";

    if (!selectedFiles.length) {
      dispatch(throwError(t("adminDashboard.publicAds.messages.invalidFile")));
      return;
    }

    const existingItems = publicAdsConfig?.[slot] || [];
    if (existingItems.length >= MAX_PUBLIC_ADS_PER_SLOT) {
      dispatch(throwError(t("adminDashboard.publicAds.messages.maxReached")));
      return;
    }

    const allowedCount = Math.max(0, MAX_PUBLIC_ADS_PER_SLOT - existingItems.length);
    const filesToUpload = selectedFiles.slice(0, allowedCount);
    if (filesToUpload.length < selectedFiles.length) {
      dispatch(throwError(t("adminDashboard.publicAds.messages.maxReached")));
    }

    setPublicAdsConfig((prev) => ({ ...prev, uploadingSlot: slot }));

    const uploadedItems = [];
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("image", file);
      // eslint-disable-next-line no-await-in-loop
      const uploadRes = await dispatch(uploadImage(formData));

      if (uploadRes?.success && uploadRes?.data?.secure_url) {
        uploadedItems.push({
          id: createClientAdId(),
          imageUrl: uploadRes.data.secure_url,
          imagePublicId: uploadRes.data.public_id || null,
          linkUrl: "",
          marqueeText: "",
          order: 0,
          isActive: true,
        });
      }
    }

    setPublicAdsConfig((prev) => ({ ...prev, uploadingSlot: null }));

    if (!uploadedItems.length) {
      dispatch(throwError(t("adminDashboard.publicAds.messages.uploadFailed")));
      return;
    }

    const previousSnapshot = getCurrentPublicAdsSnapshot();
    const nextSlotItems = normalizeAdOrder([...(previousSnapshot[slot] || []), ...uploadedItems]);
    const nextConfig = {
      ...previousSnapshot,
      [slot]: nextSlotItems,
    };

    setPublicAdsConfig((prev) => ({ ...prev, [slot]: nextSlotItems }));
    const saved = await persistPublicAdsConfig(nextConfig, {
      successMessage: t("adminDashboard.publicAds.messages.uploadSuccess"),
    });

    if (!saved) {
      setPublicAdsConfig((prev) => ({ ...prev, ...previousSnapshot }));
    }
  };

  const handleRemoveAd = async (slot, adId) => {
    const previousSnapshot = getCurrentPublicAdsSnapshot();
    const nextSlotItems = normalizeAdOrder(
      (previousSnapshot[slot] || []).filter((item) => String(item.id) !== String(adId))
    );
    const nextConfig = {
      ...previousSnapshot,
      [slot]: nextSlotItems,
    };

    setPublicAdsConfig((prev) => ({ ...prev, [slot]: nextSlotItems }));
    const saved = await persistPublicAdsConfig(nextConfig, {
      successMessage: t("adminDashboard.publicAds.messages.removeSuccess"),
    });

    if (!saved) {
      setPublicAdsConfig((prev) => ({ ...prev, ...previousSnapshot }));
    }
  };

  const handleToggleAdActive = async (slot, adId, isActive) => {
    const previousSnapshot = getCurrentPublicAdsSnapshot();
    const nextSlotItems = normalizeAdOrder(
      (previousSnapshot[slot] || []).map((item) =>
        String(item.id) === String(adId)
          ? { ...item, isActive: !!isActive }
          : item
      )
    );
    const nextConfig = {
      ...previousSnapshot,
      [slot]: nextSlotItems,
    };

    setPublicAdsConfig((prev) => ({ ...prev, [slot]: nextSlotItems }));
    const saved = await persistPublicAdsConfig(nextConfig, {
      successMessage: t("adminDashboard.publicAds.messages.toggleSuccess"),
    });

    if (!saved) {
      setPublicAdsConfig((prev) => ({ ...prev, ...previousSnapshot }));
    }
  };

  const handleAdLinkChange = (slot, adId, linkValue) => {
    setPublicAdsConfig((prev) => ({
      ...prev,
      [slot]: (prev[slot] || []).map((item) =>
        String(item.id) === String(adId) ? { ...item, linkUrl: linkValue } : item
      ),
    }));
    setLinkValidationErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[`${slot}:${adId}`];
      return nextErrors;
    });
  };

  const handleAdLinkBlur = async (slot, adId) => {
    const previousSnapshot = getCurrentPublicAdsSnapshot();
    const currentAd = (previousSnapshot[slot] || []).find(
      (item) => String(item.id) === String(adId)
    );
    if (!currentAd) return;

    const rawLinkUrl = String(currentAd.linkUrl || "").trim();
    const linkUrl = normalizeHttpLink(rawLinkUrl);
    if (rawLinkUrl && !linkUrl) {
      setLinkValidationErrors((prev) => ({
        ...prev,
        [`${slot}:${adId}`]: t("adminDashboard.publicAds.messages.invalidUrl"),
      }));
      dispatch(throwError(t("adminDashboard.publicAds.messages.invalidUrl")));
      return;
    }

    const normalizedSlotItems = normalizeAdOrder(
      (previousSnapshot[slot] || []).map((item) =>
        String(item.id) === String(adId) ? { ...item, linkUrl } : item
      )
    );
    const nextConfig = {
      ...previousSnapshot,
      [slot]: normalizedSlotItems,
    };

    setPublicAdsConfig((prev) => ({ ...prev, [slot]: normalizedSlotItems }));
    const saved = await persistPublicAdsConfig(nextConfig);

    if (!saved) {
      setPublicAdsConfig((prev) => ({ ...prev, ...previousSnapshot }));
    }
  };

  const handleAdMarqueeChange = (adId, marqueeText) => {
    setPublicAdsConfig((prev) => ({
      ...prev,
      top: (prev.top || []).map((item) =>
        String(item.id) === String(adId) ? { ...item, marqueeText } : item
      ),
    }));
  };

  const handleAdMarqueeBlur = async (adId) => {
    const previousSnapshot = getCurrentPublicAdsSnapshot();
    const normalizedTopItems = normalizeAdOrder(
      (previousSnapshot.top || []).map((item) =>
        String(item.id) === String(adId)
          ? { ...item, marqueeText: String(item.marqueeText || "").trim() }
          : item
      )
    );
    const nextConfig = {
      ...previousSnapshot,
      top: normalizedTopItems,
    };

    setPublicAdsConfig((prev) => ({ ...prev, top: normalizedTopItems }));
    const saved = await persistPublicAdsConfig(nextConfig);

    if (!saved) {
      setPublicAdsConfig((prev) => ({ ...prev, ...previousSnapshot }));
    }
  };

  const handleDimensionToggle = async (slot, isEnabled) => {
    const previousSnapshot = getCurrentPublicAdsSnapshot();
    const resolvedDimensions = getResolvedDimensions(previousSnapshot.dimensions || {});
    const nextDimensions = {
      ...normalizeDimensionsState(previousSnapshot.dimensions || {}),
      [slot]: isEnabled
        ? {
            width: resolvedDimensions[slot].width,
            height: resolvedDimensions[slot].height,
          }
        : {
            width: null,
            height: null,
          },
    };
    const nextConfig = {
      ...previousSnapshot,
      dimensions: nextDimensions,
    };

    setPublicAdsConfig((prev) => ({ ...prev, dimensions: nextDimensions }));
    const saved = await persistPublicAdsConfig(nextConfig);

    if (!saved) {
      setPublicAdsConfig((prev) => ({ ...prev, ...previousSnapshot }));
    }
  };

  const handleDimensionSliderChange = (slot, key, value) => {
    const limits = PUBLIC_AD_DIMENSION_LIMITS?.[slot]?.[key];
    const parsedValue = Math.round(Number(value));
    if (!limits || !Number.isFinite(parsedValue)) return;

    const clampedValue = Math.min(Math.max(parsedValue, limits.min), limits.max);
    setPublicAdsConfig((prev) => ({
      ...prev,
      dimensions: {
        ...normalizeDimensionsState(prev.dimensions || {}),
        [slot]: {
          ...normalizeDimensionsState(prev.dimensions || {})[slot],
          [key]: clampedValue,
        },
      },
    }));
  };

  const handleDimensionSliderCommit = async () => {
    const nextConfig = getCurrentPublicAdsSnapshot();
    await persistPublicAdsConfig(nextConfig);
  };

  const handleDragStart = (slot, adId) => {
    setDragItem({ slot, id: adId });
  };

  const handleDrop = async (slot, targetAdId) => {
    if (dragItem.slot !== slot || !dragItem.id || dragItem.id === targetAdId) {
      setDragItem({ slot: null, id: null });
      return;
    }

    const previousSnapshot = getCurrentPublicAdsSnapshot();
    const list = [...(previousSnapshot[slot] || [])];
    const sourceIndex = list.findIndex((item) => String(item.id) === String(dragItem.id));
    const targetIndex = list.findIndex((item) => String(item.id) === String(targetAdId));

    if (sourceIndex < 0 || targetIndex < 0) {
      setDragItem({ slot: null, id: null });
      return;
    }

    const [sourceItem] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, sourceItem);
    const nextSlotItems = normalizeAdOrder(list);
    const nextConfig = {
      ...previousSnapshot,
      [slot]: nextSlotItems,
    };

    setPublicAdsConfig((prev) => ({ ...prev, [slot]: nextSlotItems }));
    const saved = await persistPublicAdsConfig(nextConfig, {
      successMessage: t("adminDashboard.publicAds.messages.reorderSuccess"),
    });

    if (!saved) {
      setPublicAdsConfig((prev) => ({ ...prev, ...previousSnapshot }));
    }

    setDragItem({ slot: null, id: null });
  };

  const renderPublicAdsManager = (slot) => {
    const adsList = publicAdsConfig?.[slot] || [];
    const isTop = slot === PUBLIC_AD_SLOT.top;
    const isUploading = publicAdsConfig.uploadingSlot === slot;

    return (
      <section className="public-ads-manager">
        <div className="public-ads-manager-header">
          <h5 className="public-ads-manager-title">
            {isTop
              ? t("adminDashboard.publicAds.topTitle")
              : t("adminDashboard.publicAds.sidebarTitle")}
          </h5>
          <label className="public-ads-upload-btn">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              multiple
              disabled={publicAdsConfig.saving || isUploading}
              onChange={(event) => handleUploadAds(slot, event)}
            />
            {isUploading
              ? t("adminDashboard.publicAds.uploading")
              : t("adminDashboard.publicAds.upload")}
          </label>
        </div>

        <p className="public-ads-drag-hint">{t("adminDashboard.publicAds.dragHint")}</p>

        {!adsList.length && (
          <div className="public-ads-empty">{t("adminDashboard.publicAds.empty")}</div>
        )}

        {!!adsList.length && (
          <div className="public-ads-list">
            {adsList.map((ad) => {
              const isDragging =
                dragItem.slot === slot && String(dragItem.id) === String(ad.id);
              const errorKey = `${slot}:${ad.id}`;
              const linkError = linkValidationErrors[errorKey];

              return (
                <article
                  key={String(ad.id)}
                  className={`public-ads-item ${isDragging ? "is-dragging" : ""}`}
                  draggable={!publicAdsConfig.saving}
                  onDragStart={() => handleDragStart(slot, ad.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(slot, ad.id)}
                  onDragEnd={() => setDragItem({ slot: null, id: null })}
                >
                  <div className="public-ads-item-grid">
                    <div className="public-ads-item-preview">
                      <img src={ad.imageUrl} alt="" />
                    </div>

                    <div className="public-ads-item-body">
                      <div className="public-ads-item-head">
                        <span className="public-ads-order-chip">#{ad.order}</span>
                        <Form.Check
                          type="switch"
                          id={`public-ad-active-${slot}-${ad.id}`}
                          label={
                            ad.isActive
                              ? t("adminDashboard.publicAds.active")
                              : t("adminDashboard.publicAds.inactive")
                          }
                          checked={ad.isActive !== false}
                          onChange={(event) =>
                            handleToggleAdActive(slot, ad.id, event.target.checked)
                          }
                          disabled={publicAdsConfig.saving}
                        />
                        <button
                          type="button"
                          className="public-ads-remove-btn"
                          onClick={() => handleRemoveAd(slot, ad.id)}
                          disabled={publicAdsConfig.saving}
                        >
                          {t("adminDashboard.publicAds.remove")}
                        </button>
                      </div>

                      <label className="public-ads-link-label">
                        {t("adminDashboard.publicAds.linkLabel")}
                      </label>
                      <Form.Control
                        type="url"
                        size="sm"
                        value={ad.linkUrl || ""}
                        placeholder={t("adminDashboard.publicAds.linkPlaceholder")}
                        onChange={(event) =>
                          handleAdLinkChange(slot, ad.id, event.target.value)
                        }
                        onBlur={() => handleAdLinkBlur(slot, ad.id)}
                        disabled={publicAdsConfig.saving}
                      />
                      {linkError ? <small className="text-danger">{linkError}</small> : null}

                      {isTop ? (
                        <>
                          <label className="public-ads-link-label mt-2">
                            {t("adminDashboard.publicAds.marqueeLabel")}
                          </label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={ad.marqueeText || ""}
                            placeholder={t("adminDashboard.publicAds.marqueePlaceholder")}
                            onChange={(event) =>
                              handleAdMarqueeChange(ad.id, event.target.value)
                            }
                            onBlur={() => handleAdMarqueeBlur(ad.id)}
                            disabled={publicAdsConfig.saving}
                          />
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  const renderDimensionControl = (slot) => {
    const isTop = slot === PUBLIC_AD_SLOT.top;
    const limits = PUBLIC_AD_DIMENSION_LIMITS[slot];
    const resolvedDimensions = getResolvedDimensions(publicAdsConfig.dimensions || {});
    const slotDimensions = normalizeDimensionsState(publicAdsConfig.dimensions || {})[slot];
    const isCustomEnabled = !!(slotDimensions.width && slotDimensions.height);

    const widthValue = isCustomEnabled
      ? slotDimensions.width
      : resolvedDimensions[slot].width;
    const heightValue = isCustomEnabled
      ? slotDimensions.height
      : resolvedDimensions[slot].height;

    return (
      <section className="public-ads-dimension-box">
        <div className="public-ads-dimension-head">
          <h6 className="public-ads-dimension-title">
            {isTop
              ? t("adminDashboard.publicAds.topDimensionsTitle")
              : t("adminDashboard.publicAds.sidebarDimensionsTitle")}
          </h6>
          <Form.Check
            type="switch"
            id={`public-ad-custom-size-${slot}`}
            label={
              isCustomEnabled
                ? t("adminDashboard.publicAds.customSizeOn")
                : t("adminDashboard.publicAds.customSizeOff")
            }
            checked={isCustomEnabled}
            disabled={publicAdsConfig.saving}
            onChange={(event) => handleDimensionToggle(slot, event.target.checked)}
          />
        </div>

        <div className="public-ads-dimension-row">
          <div className="public-ads-dimension-label-wrap">
            <span className="public-ads-dimension-label">
              {t("adminDashboard.publicAds.widthLabel")}
            </span>
            <span className="public-ads-dimension-value">{widthValue}px</span>
          </div>
          <Form.Range
            min={limits.width.min}
            max={limits.width.max}
            step={1}
            value={widthValue}
            disabled={!isCustomEnabled || publicAdsConfig.saving}
            onChange={(event) =>
              handleDimensionSliderChange(slot, "width", event.target.value)
            }
            onMouseUp={handleDimensionSliderCommit}
            onTouchEnd={handleDimensionSliderCommit}
            onKeyUp={handleDimensionSliderCommit}
          />
        </div>

        <div className="public-ads-dimension-row">
          <div className="public-ads-dimension-label-wrap">
            <span className="public-ads-dimension-label">
              {t("adminDashboard.publicAds.heightLabel")}
            </span>
            <span className="public-ads-dimension-value">{heightValue}px</span>
          </div>
          <Form.Range
            min={limits.height.min}
            max={limits.height.max}
            step={1}
            value={heightValue}
            disabled={!isCustomEnabled || publicAdsConfig.saving}
            onChange={(event) =>
              handleDimensionSliderChange(slot, "height", event.target.value)
            }
            onMouseUp={handleDimensionSliderCommit}
            onTouchEnd={handleDimensionSliderCommit}
            onKeyUp={handleDimensionSliderCommit}
          />
        </div>
      </section>
    );
  };

  const getCurrentMonthIndex = () => {
    return new Date().getMonth();
  };

  // Earnings Overview Bar Chart Data
  const earningsChartData = earningsData
    ? {
        labels: earningsData.map((item) => item.monthName),
        datasets: [
          {
            label: "Earnings (₹)",
            data: earningsData.map((item) => item.earnings),
            backgroundColor: earningsData.map((item, index) =>
              index === getCurrentMonthIndex()
                ? "rgba(40, 167, 69, 0.8)"
                : "rgba(40, 167, 69, 0.6)"
            ),
            borderColor: earningsData.map((item, index) =>
              index === getCurrentMonthIndex()
                ? "rgba(40, 167, 69, 1)"
                : "rgba(40, 167, 69, 0.8)"
            ),
            borderWidth: 1,
            hoverBackgroundColor: "rgba(40, 167, 69, 0.9)",
          },
        ],
      }
    : null;

  const verificationChartData = verificationData
    ? {
        labels: [t("common.verified"), t("common.unverified")],
        datasets: [
          {
            label: "Providers",
            data: [
              verificationData.verified || 0,
              verificationData.unverified || 0,
            ],
            backgroundColor: ["#28a745", "#dc3545"],
            borderColor: ["#1e7e34", "#c82333"],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const locale = i18n.language === "ru" ? "ru-RU" : i18n.language === "cz" || i18n.language === "cs" ? "cs-CZ" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return t("adminDashboard.appAccess.notUpdated");
    const locale = i18n.language === "ru" ? "ru-RU" : i18n.language === "cz" || i18n.language === "cs" ? "cs-CZ" : "en-US";
    return new Date(dateString).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLastUpdatedBy = () => {
    const updatedBy = appAccessSetting.updatedBy;
    if (!updatedBy) return t("adminDashboard.appAccess.system");
    const fullName = `${updatedBy.firstName || ""} ${updatedBy.lastName || ""}`.trim();
    return fullName || updatedBy.email || t("adminDashboard.appAccess.system");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "badge bg-success";
      case "pending":
        return "badge bg-warning";
      case "accepted":
        return "badge bg-info";
      case "rejected":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const renderPublicAdsSection = () => (
    <Row className="mb-4">
      <Col xl={10}>
        <Card className="public-ads-card">
          <Card.Body>
            <div className="public-ads-card-head">
              <div>
                <h4 className="public-ads-title">{t("adminDashboard.publicAds.title")}</h4>
                <p className="public-ads-description">
                  {t("adminDashboard.publicAds.description")}
                </p>
              </div>
              {publicAdsConfig.saving ? (
                <span className="public-ads-saving-label">
                  {t("adminDashboard.publicAds.saving")}
                </span>
              ) : null}
            </div>

            <div className="public-ads-size-guide">
              <p className="public-ads-size-title">
                {t("adminDashboard.publicAds.sizeGuideTitle")}
              </p>
              <ul>
                <li>{t("adminDashboard.publicAds.topSize")}</li>
                <li>{t("adminDashboard.publicAds.sidebarSize")}</li>
                <li>{t("adminDashboard.publicAds.mobileTopSize")}</li>
              </ul>
            </div>

            <div className="public-ads-dimension-grid">
              {renderDimensionControl(PUBLIC_AD_SLOT.top)}
              {renderDimensionControl(PUBLIC_AD_SLOT.sidebar)}
            </div>

            <div className="public-ads-grid">
              {renderPublicAdsManager(PUBLIC_AD_SLOT.top)}
              {renderPublicAdsManager(PUBLIC_AD_SLOT.sidebar)}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (isPublicAdsView) {
    return (
      <Container fluid className="admin-dashboard">
        <Row className="mb-4">
          <Col>
            <h2 className="dashboard-title">{t("adminDashboard.publicAds.title")}</h2>
          </Col>
        </Row>
        {renderPublicAdsSection()}
      </Container>
    );
  }

  return (
    <Container fluid className="admin-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 className="dashboard-title">{t("adminDashboard.title")}</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xl={8}>
          <Card className="app-access-card">
            <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <div className="app-access-title">
                  {t("adminDashboard.appAccess.title")}
                </div>
                <div className="app-access-description">
                  {t("adminDashboard.appAccess.description")}
                </div>
                <div className="app-access-meta">
                  {appAccessSetting.loading
                    ? t("adminDashboard.appAccess.loading")
                    : t("adminDashboard.appAccess.lastUpdated", {
                        date: formatDateTime(appAccessSetting.updatedAt),
                        user: getLastUpdatedBy(),
                      })}
                </div>
              </div>
              <Form.Check
                type="switch"
                id="provider-subscription-toggle"
                className="app-access-switch"
                checked={appAccessSetting.requireProviderSubscription}
                onChange={handleProviderSubscriptionToggle}
                disabled={appAccessSetting.loading || appAccessSetting.saving}
                label={
                  appAccessSetting.requireProviderSubscription
                    ? t("adminDashboard.appAccess.proMode")
                    : t("adminDashboard.appAccess.freeMode")
                }
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="filter-label">Filter by Provider</Form.Label>
            <ProviderFilter
              providers={providers}
              selectedProvider={selectedProvider}
              onChange={handleProviderChange}
              placeholder="Select a provider..."
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="summary-card providers-card">
            <Card.Body>
              <div className="summary-icon">
                <FaUsers />
              </div>
              <div className="summary-content">
                <div className="summary-label">Number of Providers</div>
                <div className="summary-value">
                  {summaryData?.numberOfProviders || 0}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card providers-card">
            <Card.Body>
              <div className="summary-icon">
                <FaUsers />
              </div>
              <div className="summary-content">
                <div className="summary-label">Number of Clients</div>
                <div className="summary-value">
                  {summaryData?.numberOfClients || 0}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card services-card">
            <Card.Body>
              <div className="summary-icon">
                <FaBox />
              </div>
              <div className="summary-content">
                <div className="summary-label">Number of Services</div>
                <div className="summary-value">
                  {summaryData?.numberOfServices || 0}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card orders-card">
            <Card.Body>
              <div className="summary-icon">
                <FaShoppingCart />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Orders</div>
                <div className="summary-value">
                  {summaryData?.totalOrders || 0}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div
        className="d-flex align-items-stretch justify-content-between w-100 "
        style={{ gap: "30px" }}
      >
        <div className="flex-fill w-100 ">
          <Row className="mb-4">
            <Col>
              <Card className="chart-card">
                <Card.Header className="d-flex align-items-center justify-content-between ">
                  <h5 className="mb-0 mx-auto" style={{ color: "black" }}>
                    Earnings Overview
                  </h5>
                </Card.Header>
                <Card.Body>
                  {earningsChartData ? (
                    <div className="chart-container">
                      <Bar
                        data={earningsChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                title: function (context) {
                                  return context[0].label;
                                },
                                label: function (context) {
                                  return `Earnings: CZK${context.parsed.y.toLocaleString()}`;
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function (value) {
                                  return `CZK${value.toLocaleString()}`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-center text-muted">No data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
        <div className="flex-fill w-100">
          <div className="mb-4">
            {/* <Col md={6}> */}
            <Card className="chart-card">
              <Card.Header className="d-flex align-items-center justify-content-between ">
                <h5 className="mb-0 mx-auto" style={{ color: "black" }}>
                  Provider Verification Status
                </h5>
              </Card.Header>
              <Card.Body>
                {verificationChartData ? (
                  <div className="chart-container">
                    <Bar
                      data={verificationChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                const label = context.label || "";
                                const value = context.parsed.y || 0;
                                return `${label}: ${value} providers`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-center text-muted">No data available</p>
                )}
              </Card.Body>
            </Card>
            {/* </Col> */}
          </div>
        </div>
      </div>

      <Row>
        <Col>
          <Card className="orders-list-card">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-0" style={{ color: "black" }}>
                  Orders List
                </h5>
                <small className="text-muted">
                  Total: {ordersList.length} orders
                </small>
              </div>
              <div
                className="d-flex align-items-center gap-3"
              >
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ width: "200px" }}
                >
                  <option value="">All Status</option>
                  <option value="completed">{t("common.completed")}</option>
                  <option value="pending">{t("common.pending")}</option>
                  <option value="accepted">{t("common.accepted")}</option>
                  <option value="rejected">{t("common.rejected")}</option>
                </Form.Select>
                <DateFilter onFilterChange={setOrdersDateFilter} />
              </div>
            </Card.Header>

            <Card.Body>
              {ordersList.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>{t("order.table.header1")}</th>
                        <th>{t("order.table.header4")}</th>
                        <th>{t("order.table.header5")}</th>
                        <th>{t("order.table.header1")}</th>
                        <th>{t("order.table.header6")}</th>
                        <th>{t("order.table.header2")}</th>
                        <th>{t("common.status")}</th>
                        <th>{t("order.table.header7")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersList.map((order) => (
                        <tr key={order._id}>
                          <td>{order._id.substring(0, 8)}...</td>
                          <td>{order.user?.name || "-"}</td>
                          <td>{order.provider?.name || "-"}</td>
                          <td>{order.service?.title || "-"}</td>
                          <td>{formatDate(order.bookingDate)}</td>
                          <td>CZK{order.totalPrice?.toLocaleString() || "0"}</td>
                          <td>
                            <span className={getStatusBadgeClass(order.status)}>
                              {order.status ? t(`common.${order.status}`) : "-"}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted">No orders found</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
