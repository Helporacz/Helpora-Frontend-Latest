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
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getMyKyc,
  getProviderMonthlyEarnings,
  getProviderMonthlyOrders,
  getProviderOrdersSummary,
  getProviderServiceStatus,
  getProviderSummary,
} from "store/globalSlice";
import "./ProviderDashboard.scss";
import { PiHandCoinsThin } from "react-icons/pi";

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
  const navigate = useNavigate();
  const [serviceStatusData, setServiceStatusData] = useState(null);
  const [ordersSummary, setOrdersSummary] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyOrders, setMonthlyOrders] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
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
