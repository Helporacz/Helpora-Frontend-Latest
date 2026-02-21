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
import { FaUsers, FaBox, FaShoppingCart, FaChartLine } from "react-icons/fa";
import {
  getAdminOrdersList,
  getAdminEarningsOverview,
  getProviderVerificationStatus,
  getAllProviders,
  getAdminSummary,
} from "store/globalSlice";
import DateFilter from "components/Dashboard/DateFilter";
import ProviderFilter from "components/Dashboard/ProviderFilter";
import "./AdminDashboard.scss";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ordersList, setOrdersList] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
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
    fetchProviders();
  }, [fetchProviders]);

  // Initial load - fetch all data except orders list
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchSummary(),
      fetchEarningsOverview(),
      fetchVerificationStatus(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [fetchSummary, fetchEarningsOverview, fetchVerificationStatus]);

  // Separate effect for Orders List - only runs when orders filters change
  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  const handleProviderChange = (selectedOption) => {
    setSelectedProvider(selectedOption);
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    <Container fluid className="admin-dashboard">
      <Row className="mb-4">
        <Col>
          <h2 className="dashboard-title">Admin Dashboard</h2>
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
