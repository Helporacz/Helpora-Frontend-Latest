import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import DateFilter from "components/Dashboard/DateFilter";
import { useCallback, useEffect, useState } from "react";
import { Card, Col, Container, Modal, Row } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import {
  FaBox,
  FaChartPie,
  FaClipboardList,
  FaRupeeSign,
  FaShoppingCart,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getMyKyc,
  getProviderMonthlyEarnings,
  getProviderMonthlyOrders,
  getProviderOrdersSummary,
  getUserProfile,
  getProviderServiceStatus,
  getProviderSummary,
  submitProviderRankingRequest,
  throwError,
  throwSuccess,
} from "store/globalSlice";
import "./ProviderDashboard.scss";
import { PiHandCoinsThin } from "react-icons/pi";
import { localizeRankBadgeLabel } from "utils/rankingLabel";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const ProviderDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const providerProfile = useSelector((state) => state.global?.adminData || {});
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [serviceStatusData, setServiceStatusData] = useState(null);
  const [ordersSummary, setOrdersSummary] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyOrders, setMonthlyOrders] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rankingRequestLoading, setRankingRequestLoading] = useState(false);
  const [showRankingRequestModal, setShowRankingRequestModal] = useState(false);
  const [rankingRequestForm, setRankingRequestForm] = useState({
    preferred_position: "",
    preferred_start_at: "",
    preferred_end_at: "",
    message: "",
  });
  const [showKycPrompt, setShowKycPrompt] = useState(false);
  const [kycActionLabel, setKycActionLabel] = useState("Start KYC");
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
  const [monthlyDateFilter, setMonthlyDateFilter] = useState(() => {
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

  const fetchSummaryData = useCallback(async () => {
    try {
      const res = await dispatch(getProviderSummary());
      if (res?.success) {
        setSummaryData(res.data);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  }, [dispatch]);

  const fetchKycStatus = useCallback(async () => {
    try {
      const res = await dispatch(getMyKyc());
      if (res?.status === 200) {
        const status = res?.kyc?.status || "draft";
        const labelMap = {
          draft: "Continue",
          submitted: "View",
          resubmit: "Edit",
          rejected: "Add New KYC",
          approved: "View",
        };
        setKycActionLabel(labelMap[status] || "Start KYC");
        setShowKycPrompt(!res.providerVerified);
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    }
  }, [dispatch]);

  const fetchOrdersSummary = useCallback(async () => {
    try {
      const params = {
        dateFilter: ordersDateFilter.dateFilter,
        ...(ordersDateFilter.startDate && {
          startDate: ordersDateFilter.startDate.toISOString(),
        }),
        ...(ordersDateFilter.endDate && {
          endDate: ordersDateFilter.endDate.toISOString(),
        }),
      };
      const res = await dispatch(getProviderOrdersSummary(params));
      if (res?.success) {
        setOrdersSummary(res.data);
      }
    } catch (error) {
      console.error("Error fetching orders summary:", error);
    }
  }, [
    dispatch,
    ordersDateFilter.dateFilter,
    ordersDateFilter.startDate?.getTime(),
    ordersDateFilter.endDate?.getTime(),
  ]);

  const fetchMonthlyData = useCallback(async () => {
    try {
      const params = {
        dateFilter: monthlyDateFilter.dateFilter,
        ...(monthlyDateFilter.startDate && {
          startDate: monthlyDateFilter.startDate.toISOString(),
        }),
        ...(monthlyDateFilter.endDate && {
          endDate: monthlyDateFilter.endDate.toISOString(),
        }),
      };

      const [monthlyOrdersRes, monthlyEarningsRes] = await Promise.all([
        dispatch(getProviderMonthlyOrders(params)),
        dispatch(getProviderMonthlyEarnings(params)),
      ]);

      if (monthlyOrdersRes?.success) {
        setMonthlyOrders(monthlyOrdersRes.data);
      }
      if (monthlyEarningsRes?.success) {
        setMonthlyEarnings(monthlyEarningsRes.data);
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
  }, [
    dispatch,
    monthlyDateFilter.dateFilter,
    monthlyDateFilter.startDate?.getTime(),
    monthlyDateFilter.endDate?.getTime(),
  ]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [serviceStatus] = await Promise.all([
        dispatch(getProviderServiceStatus()),
      ]);

      if (serviceStatus?.success) {
        setServiceStatusData(serviceStatus.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchSummaryData();
    fetchDashboardData();
    fetchKycStatus();
  }, [fetchSummaryData, fetchDashboardData, fetchKycStatus]);

  useEffect(() => {
    fetchOrdersSummary();
  }, [fetchOrdersSummary]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  const getCurrentMonthIndex = () => {
    return new Date().getMonth();
  };

  const serviceStatusChartData = serviceStatusData
    ? {
        labels: [t("common.active"), t("common.deactivated")],
        datasets: [
          {
            label: "Services",
            data: [
              serviceStatusData.active || 0,
              serviceStatusData.deactivated || 0,
            ],
            backgroundColor: ["#28a745", "#dc3545"],
            borderColor: ["#1e7e34", "#c82333"],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const ordersSummaryChartData = ordersSummary
    ? {
        labels: [
          t("common.completed"),
          t("common.pending"),
          t("common.accepted"),
          t("common.rejected"),
        ],
        datasets: [
          {
            label: "Orders",
            data: [
              ordersSummary.completed || 0,
              ordersSummary.pending || 0,
              ordersSummary.accepted || 0,
              ordersSummary.rejected || 0,
            ],
            backgroundColor: ["#28a745", "#ffc107", "#17a2b8", "#dc3545"],
            borderColor: ["#1e7e34", "#e0a800", "#138496", "#c82333"],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const monthlyOrdersChartData = monthlyOrders
    ? {
        labels: monthlyOrders.map((item) => item.monthName),
        datasets: [
          {
            label: "Orders",
            data: monthlyOrders.map((item) => item.count),
            backgroundColor: monthlyOrders.map((item, index) =>
              index === getCurrentMonthIndex()
                ? "rgba(54, 162, 235, 0.8)"
                : "rgba(54, 162, 235, 0.6)"
            ),
            borderColor: monthlyOrders.map((item, index) =>
              index === getCurrentMonthIndex()
                ? "rgba(54, 162, 235, 1)"
                : "rgba(54, 162, 235, 0.8)"
            ),
            borderWidth: 1,
            hoverBackgroundColor: "rgba(54, 162, 235, 0.9)",
          },
        ],
      }
    : null;

  const completedJobs =
    ordersSummary?.completed ??
    summaryData?.completedOrders ??
    0;

  const recentBookingsTotal = ordersSummary
    ? (ordersSummary.completed || 0) +
      (ordersSummary.pending || 0) +
      (ordersSummary.accepted || 0) +
      (ordersSummary.rejected || 0)
    : summaryData?.totalOrders || 0;

  const demandLabel =
    recentBookingsTotal >= 10
      ? "High demand this month"
      : recentBookingsTotal >= 5
      ? "Moderate demand"
      : "Warming up";

  const monthlyEarningsChartData = monthlyEarnings
    ? {
        labels: monthlyEarnings.map((item) => item.monthName),
        datasets: [
          {
            label: "Earnings (CZK)",
            data: monthlyEarnings.map((item) => item.earnings),
            backgroundColor: monthlyEarnings.map((item, index) =>
              index === getCurrentMonthIndex()
                ? "rgba(40, 167, 69, 0.8)"
                : "rgba(40, 167, 69, 0.6)"
            ),
            borderColor: monthlyEarnings.map((item, index) =>
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

  const rankingPosition = Number(providerProfile?.ranking_position);
  const isRankingActive =
    !!providerProfile?.is_ranked &&
    Number.isInteger(rankingPosition) &&
    rankingPosition > 0;
  const rankingRequestStatus =
    providerProfile?.ranking_request?.status || "none";
  const rankingRequestRequestedAt = providerProfile?.ranking_request?.requested_at;
  const rankingBadgeLabel = localizeRankBadgeLabel(
    providerProfile?.rank_badge_label,
    t,
    t("topProviders.featuredRibbon")
  );

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const openRankingRequestModal = () => {
    if (rankingRequestLoading || rankingRequestStatus === "pending") return;
    const preferredPosition = Number(
      providerProfile?.ranking_request?.preferred_position
    );
    setRankingRequestForm({
      preferred_position:
        Number.isInteger(preferredPosition) && preferredPosition > 0
          ? String(preferredPosition)
          : "",
      preferred_start_at: toDateTimeLocal(
        providerProfile?.ranking_request?.preferred_start_at
      ),
      preferred_end_at: toDateTimeLocal(
        providerProfile?.ranking_request?.preferred_end_at
      ),
      message: providerProfile?.ranking_request?.message || "",
    });
    setShowRankingRequestModal(true);
  };

  const closeRankingRequestModal = () => {
    if (rankingRequestLoading) return;
    setShowRankingRequestModal(false);
  };

  const handleRankingRequest = async () => {
    if (rankingRequestLoading || rankingRequestStatus === "pending") return;

    const preferredPositionRaw = rankingRequestForm.preferred_position;
    const hasPreferredPosition = String(preferredPositionRaw || "").trim() !== "";
    let preferredPosition = null;
    if (hasPreferredPosition) {
      preferredPosition = Number(preferredPositionRaw);
      if (!Number.isInteger(preferredPosition) || preferredPosition <= 0) {
        dispatch(throwError(t("providerDashboard.rankingRequestInvalidRank")));
        return;
      }
    }

    const parseDateValue = (value) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date;
    };

    const preferredStartAt = parseDateValue(rankingRequestForm.preferred_start_at);
    const preferredEndAt = parseDateValue(rankingRequestForm.preferred_end_at);

    if (preferredStartAt && preferredEndAt && preferredStartAt > preferredEndAt) {
      dispatch(throwError(t("providerDashboard.rankingRequestInvalidDateRange")));
      return;
    }

    const payload = {
      message: rankingRequestForm.message || "",
      preferred_position: hasPreferredPosition ? preferredPosition : "",
      preferred_start_at: rankingRequestForm.preferred_start_at || "",
      preferred_end_at: rankingRequestForm.preferred_end_at || "",
    };

    setRankingRequestLoading(true);
    try {
      const response = await dispatch(submitProviderRankingRequest(payload));
      if (response?.success) {
        dispatch(throwSuccess(t("providerDashboard.rankingRequestSuccess")));
        if (userId) {
          await dispatch(getUserProfile(userId));
        }
        setShowRankingRequestModal(false);
      } else {
        dispatch(
          throwError(
            response?.message || t("providerDashboard.rankingRequestFailed")
          )
        );
      }
    } catch (error) {
      dispatch(throwError(t("providerDashboard.rankingRequestFailed")));
    } finally {
      setRankingRequestLoading(false);
    }
  };

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

  return (
    <Container fluid className="provider-dashboard">
      <div className="mb-4">
        <div>
          <h2 className="dashboard-title">Provider Dashboard</h2>
        </div>
      </div>

      <Row className="mb-4">
        <Col>
          <Card className="summary-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">
                  {t("providerDashboard.rankingStatusTitle")}
                </div>
                <div className="summary-value">
                  {isRankingActive
                    ? t("providerDashboard.rankingStatusActive", {
                        position: rankingPosition,
                      })
                    : t("providerDashboard.rankingStatusInactive")}
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  {isRankingActive
                    ? t("providerDashboard.rankingStatusHintActive", {
                        badge: rankingBadgeLabel,
                      })
                    : t("providerDashboard.rankingStatusHintInactive")}
                </div>
                <div className="ranking-request-block">
                  <button
                    type="button"
                    className="ranking-request-btn"
                    onClick={openRankingRequestModal}
                    disabled={
                      rankingRequestLoading || rankingRequestStatus === "pending"
                    }
                  >
                    {rankingRequestLoading
                      ? t("providerDashboard.rankingRequestLoading")
                      : rankingRequestStatus === "pending"
                      ? t("providerDashboard.rankingRequestPendingButton")
                      : t("providerDashboard.rankingRequestButton")}
                  </button>
                  <p className="ranking-request-hint">
                    {rankingRequestStatus === "pending"
                      ? t("providerDashboard.rankingRequestPendingHint")
                      : rankingRequestStatus === "approved"
                      ? t("providerDashboard.rankingRequestApprovedHint")
                      : rankingRequestStatus === "denied"
                      ? t("providerDashboard.rankingRequestDeniedHint")
                      : t("providerDashboard.rankingRequestDefaultHint")}
                    {rankingRequestRequestedAt
                      ? ` (${new Date(rankingRequestRequestedAt).toLocaleString()})`
                      : ""}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        centered
        show={showRankingRequestModal}
        onHide={closeRankingRequestModal}
        dialogClassName="tw-max-w-2xl tw-mx-3 md:tw-mx-auto"
        contentClassName="tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-shadow-[0_20px_60px_rgba(15,23,42,0.22)]"
      >
        <div className="tw-relative tw-overflow-hidden tw-border-b tw-border-slate-200 tw-bg-gradient-to-r tw-from-slate-50 tw-via-white tw-to-emerald-50 tw-px-5 tw-py-4 md:tw-px-6 md:tw-py-5">
          <div className="tw-pr-10">
            <h3 className="tw-mb-1 tw-text-xl tw-font-semibold tw-text-slate-900">
              {t("providerDashboard.rankingRequestModalTitle")}
            </h3>
            <p className="tw-m-0 tw-text-sm tw-text-slate-600">
              {t("providerDashboard.rankingRequestModalSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={closeRankingRequestModal}
            className="tw-absolute tw-right-4 tw-top-4 tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-full tw-border tw-border-slate-200 tw-bg-white tw-text-lg tw-leading-none tw-text-slate-500 tw-transition hover:tw-bg-slate-100 hover:tw-text-slate-700"
            aria-label={t("common.close")}
          >
            &times;
          </button>
        </div>

        <div className="tw-px-5 tw-py-4 md:tw-px-6 md:tw-py-5">
          <div className="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
            <div className="tw-space-y-1.5">
              <label className="tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("providerDashboard.rankingRequestModalRank")}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={rankingRequestForm.preferred_position}
                onChange={(event) =>
                  setRankingRequestForm((prev) => ({
                    ...prev,
                    preferred_position: event.target.value,
                  }))
                }
                placeholder={t("providerDashboard.rankingRequestModalRankPlaceholder")}
                className="tw-h-12 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-slate-50 tw-px-4 tw-text-sm tw-text-slate-800 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-bg-white focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>

            <div className="tw-space-y-1.5">
              <label className="tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("providerDashboard.rankingRequestModalStart")}
              </label>
              <input
                type="datetime-local"
                value={rankingRequestForm.preferred_start_at}
                onChange={(event) =>
                  setRankingRequestForm((prev) => ({
                    ...prev,
                    preferred_start_at: event.target.value,
                  }))
                }
                className="tw-h-12 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-slate-50 tw-px-4 tw-text-sm tw-text-slate-800 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-bg-white focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>

            <div className="tw-space-y-1.5">
              <label className="tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("providerDashboard.rankingRequestModalEnd")}
              </label>
              <input
                type="datetime-local"
                value={rankingRequestForm.preferred_end_at}
                onChange={(event) =>
                  setRankingRequestForm((prev) => ({
                    ...prev,
                    preferred_end_at: event.target.value,
                  }))
                }
                className="tw-h-12 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-slate-50 tw-px-4 tw-text-sm tw-text-slate-800 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-bg-white focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>

            <div className="md:tw-col-span-2 tw-space-y-1.5">
              <label className="tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("providerDashboard.rankingRequestModalMessage")}
              </label>
              <textarea
                rows={5}
                value={rankingRequestForm.message}
                onChange={(event) =>
                  setRankingRequestForm((prev) => ({
                    ...prev,
                    message: event.target.value,
                  }))
                }
                placeholder={t("providerDashboard.rankingRequestModalMessagePlaceholder")}
                className="tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-slate-50 tw-px-4 tw-py-3 tw-text-sm tw-text-slate-800 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-bg-white focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>
          </div>
        </div>

        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-end tw-gap-2 tw-border-t tw-border-slate-200 tw-bg-slate-50 tw-px-5 tw-py-4 md:tw-px-6">
          <button
            type="button"
            onClick={closeRankingRequestModal}
            disabled={rankingRequestLoading}
            className="tw-inline-flex tw-items-center tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition hover:tw-bg-slate-100 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleRankingRequest}
            disabled={rankingRequestLoading}
            className="tw-inline-flex tw-items-center tw-rounded-xl tw-bg-emerald-600 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-emerald-700 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
          >
            {rankingRequestLoading
              ? t("providerDashboard.rankingRequestLoading")
              : t("providerDashboard.rankingRequestModalSubmit")}
          </button>
        </div>
      </Modal>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="summary-card earnings-card">
            <Card.Body>
              <div className="summary-icon">
                {/* <FaRupeeSign /> */}
                <PiHandCoinsThin />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Earnings</div>
                <div className="summary-value">
                  CZK{summaryData?.totalEarnings?.toLocaleString() || "0"}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
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
        <Col md={4}>
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

      {/* Light-weight metrics */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">Total jobs completed</div>
                <div className="summary-value">{completedJobs}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Counts completed bookings to date.
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">Recent bookings</div>
                <div className="summary-value">{recentBookingsTotal}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Bookings in the current date filter (defaults to this month).
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">Demand indicator</div>
                <div className="summary-value">{demandLabel}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Simple signal based on recent bookings.
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 ">
        <div className="flex-fill w-50 ">
          {/* <Col md={6}> */}
          <Card className="chart-card">
            <Card.Header
              className="d-flex align-items-center justify-content-between "
              style={{ background: "#eeeff0" }}
            >
              <h5 className="mb-0 mx-auto" style={{ color: "black" }}>
                <FaChartPie className="me-2" style={{ color: "black" }} />{" "}
                Service Status
              </h5>
            </Card.Header>
            <Card.Body>
              {serviceStatusChartData ? (
                <div className="chart-container">
                  <Pie
                    data={serviceStatusChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const label = context.label || "";
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce(
                                (a, b) => a + b,
                                0
                              );
                              const percentage =
                                total > 0
                                  ? ((value / total) * 100).toFixed(1)
                                  : 0;
                              return `${label}: ${value} (${percentage}%)`;
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
          {/* </Col> */}
        </div>
        <div className="flex-fill w-50 ">
          {/* <Col md={6}> */}
          <Card className="chart-card">
            <Card.Header
              className="d-flex align-items-center justify-content-between "
              style={{ background: "#eeeff0" }}
            >
              <h5 className="mb-0 mx-auto" style={{ color: "black" }}>
                <FaClipboardList className="me-2" style={{ color: "black" }} />
                Orders Summary
              </h5>
            </Card.Header>
            <div
              className="date-filter-inline"
              style={{ marginInline: "20px" }}
            >
              <DateFilter onFilterChange={setOrdersDateFilter} />
            </div>
            <Card.Body>
              {ordersSummaryChartData ? (
                <div className="chart-container">
                  <Bar
                    data={ordersSummaryChartData}
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
                              return `${context.label}: ${context.parsed.y} orders`;
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
      </Row>

      <div className="d-flex" style={{ gap: "20px",alignItems:"stretch" }}>
        <div className="flex-fill w-50 h-full">
          <Row className="mb-4">
            <Col>
              <Card className="chart-card">
                <Card.Header
                  className="d-flex align-items-center justify-content-between "
                  style={{ background: "#eeeff0" }}
                >
                  <h5 className="mb-0 mx-auto" style={{ color: "black" }}>
                    Yearly Orders
                  </h5>
                </Card.Header>
                <Card.Body>
                  {monthlyOrdersChartData ? (
                    <div className="chart-container">
                      <Bar
                        data={monthlyOrdersChartData}
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
                                  return `Orders: ${context.parsed.y}`;
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
            </Col>
          </Row>
        </div>
        <div className="flex-fill w-50 ">
          <Row className="mb-4">
            <Col>
              <Card className="chart-card">
                <Card.Header className="d-flex align-items-center justify-content-between " style={{ background: "#eeeff0" }}>
                  <h5 className="mb-0 mx-auto" style={{ color: "black" }}>
                    Yearly Earnings
                  </h5>
                </Card.Header>
                <Card.Body>
                  {monthlyEarningsChartData ? (
                    <div className="chart-container">
                      <Bar
                        data={monthlyEarningsChartData}
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
      </div>

      <Modal
        show={showKycPrompt}
        onHide={() => setShowKycPrompt(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>KYC Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please complete your KYC to activate your provider account.
        </Modal.Body>
        <Modal.Footer>
          <button
            variant="secondary"
            onClick={() => setShowKycPrompt(false)}
            className="px-4 py-2"
            style={{
              border: "none",
              backgroundColor: "#0d6efd",
              color: "white",
              borderRadius: "12px",
            }}
          >
            Close
          </button>
          <button
            variant="primary"
            onClick={() => navigate("/kyc-process")}
            className="px-4 py-2"
            style={{
              border: "none",
              backgroundColor: "#0d6efd",
              color: "white",
              borderRadius: "12px",
            }}
          >
            Go to KYC
          </button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProviderDashboard;
