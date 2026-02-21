import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Badge, Card, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";

import SearchInput from "components/form/SearchInput";
import Button from "components/form/Button";
import UserProfileLayout from "components/layouts/UserProfileLayout";
import {
  cancelAdminSubscriber,
  getAdminSubscriberStats,
  getAdminSubscribers,
  throwError,
  throwSuccess,
} from "store/globalSlice";
import "./Subscribers.scss";


const Subscribers = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [tableState, setTableState] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    data: [],
    loading: true,
    search: "",
    status: "all",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cancelState, setCancelState] = useState({
    show: false,
    loading: false,
    subscriber: null,
  });
  const [viewState, setViewState] = useState({
    show: false,
    subscriber: null,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(tableState.search);
    }, 400);

    return () => clearTimeout(handler);
  }, [tableState.search]);

  useEffect(() => {
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, tableState.status, tableState.limit]);

  const fetchStats = useCallback(async () => {
    const res = await dispatch(getAdminSubscriberStats());
    if (res?.success) {
      setStats(res.data);
      
    }
  }, [dispatch]);

  const fetchSubscribers = useCallback(async () => {
    setTableState((prev) => ({ ...prev, loading: true }));
    const params = {
      page: tableState.page,
      limit: tableState.limit,
      search: debouncedSearch,
      status: tableState.status,
    };
    const res = await dispatch(getAdminSubscribers(params));
    if (res?.success) {
      setTableState((prev) => ({
        ...prev,
        data: res.data || [],
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        loading: false,
      }));
    } else {
      setTableState((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableState.page, tableState.limit, tableState.status, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(i18n.language === "cz" ? "cs-CZ" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount, currency) => {
    if (amount === null || amount === undefined || !currency) return "-";
    try {
      return new Intl.NumberFormat(i18n.language === "cz" ? "cs-CZ" : "en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    } catch (error) {
      return `${amount / 100} ${currency.toUpperCase()}`;
    }
  };

  const getStatusLabel = (status, cancelAtPeriodEnd) => {
    if (cancelAtPeriodEnd) return t("subscription.cancellingLabel");
    switch (status) {
      case "active":
        return t("subscribers.statusActive");
      case "trialing":
        return t("subscribers.statusTrialing");
      case "past_due":
        return t("subscribers.statusPastDue");
      case "canceled":
      case "cancelled":
        return t("subscribers.statusCanceled");
      default:
        return status || "-";
    }
  };

  const getStatusVariant = (status, cancelAtPeriodEnd) => {
    if (cancelAtPeriodEnd) return "warning";
    switch (status) {
      case "active":
        return "success";
      case "trialing":
        return "info";
      case "past_due":
        return "danger";
      case "canceled":
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const labelCellStyle = {
    padding: "10px 14px",
    fontSize: "13px",
    color: "#6c757d",
    borderBottom: "1px solid #f0f0f0",
    width: "45%",
  };

  const valueCellStyle = {
    padding: "10px 14px",
    fontWeight: 500,
    borderBottom: "1px solid #f0f0f0",
  };


  

  const openCancelModal = (subscriber) => {
    setCancelState({ show: true, loading: false, subscriber });
  };

  const openViewModal = (subscriber) => {
    setViewState({ show: true, subscriber });
  };

  const closeViewModal = () => {
    setViewState({ show: false, subscriber: null });
  };

  const handleCancelSubscription = async () => {
    if (!cancelState.subscriber?._id) return;
    setCancelState((prev) => ({ ...prev, loading: true }));
    const res = await dispatch(cancelAdminSubscriber(cancelState.subscriber._id));
    if (res?.success) {
      dispatch(throwSuccess(res?.message || t("subscribers.cancelTitle")));
      await fetchSubscribers();
      await fetchStats();
    } else {
      dispatch(throwError(res?.message || t("subscription.errorStart")));
    }
    setCancelState({ show: false, loading: false, subscriber: null });
  };

  return (
    <Container fluid className="admin-subscribers">
      <Row className="mb-4">
        <Col>
          <h2 className="dashboard-title">{t("subscribers.title")}</h2>
          <p className="dashboard-subtitle">{t("subscribers.subtitle")}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="summary-card subscribers-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">{t("subscribers.paidProviders")}</div>
                <div className="summary-value">{stats?.activeCount || 0}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card active-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">{t("subscribers.trialingSubscribers")}</div>
                <div className="summary-value">{stats?.trialingCount || 0}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card revenue-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">{t("subscribers.mrrLabel")}</div>
                <div className="summary-value">
                  {formatAmount(stats?.mrr || 0, stats?.currency || "czk")}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="summary-card cancel-card">
            <Card.Body>
              <div className="summary-content">
                <div className="summary-label">{t("subscribers.cancelingLabel")}</div>
                <div className="summary-value">{stats?.cancelingCount || 0}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      

      <Card className="subscribers-table-card">
        <Card.Header className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div>
            <h5 className="mb-0">{t("subscribers.title")}</h5>
            <small className="text-muted">
              {t("table.pagination.results")} {tableState.total}
            </small>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <SearchInput
              placeholder={t("subscribers.searchPlaceholder")}
              value={tableState.search}
              onChange={(e) =>
                setTableState((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Form.Select
              className="status-filter"
              value={tableState.status}
              onChange={(e) =>
                setTableState((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">{t("subscribers.statusFilterAll")}</option>
              <option value="active">{t("subscribers.statusActive")}</option>
              <option value="trialing">{t("subscribers.statusTrialing")}</option>
            </Form.Select>
            <Form.Select
              className="page-size"
              value={tableState.limit}
              onChange={(e) =>
                setTableState((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                }))
              }
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>{t("subscribers.tableProvider")}</th>
                  <th>{t("subscribers.tableStatus")}</th>
                  <th>{t("subscribers.tablePlan")}</th>
                  <th>{t("subscribers.tableNextBilling")}</th>
                  <th>{t("subscribers.tableAction")}</th>
                </tr>
              </thead>
              <tbody>
                {tableState.loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!tableState.loading && tableState.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      {t("subscribers.noData")}
                    </td>
                  </tr>
                )}
                {!tableState.loading &&
                  tableState.data.map((subscriber) => (
                    <tr key={subscriber._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <UserProfileLayout
                            isSquare
                            size="40"
                            url={subscriber.profileImage}
                          />
                          <div>
                            <div className="text-13-500-21 color-black-100">
                              {subscriber.name || "-"}
                            </div>
                            <div className="text-12-500 color-black-60">
                              {subscriber.email || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg={getStatusVariant(
                            subscriber.subscription?.status,
                            subscriber.subscription?.cancelAtPeriodEnd
                          )}
                        >
                          {getStatusLabel(
                            subscriber.subscription?.status,
                            subscriber.subscription?.cancelAtPeriodEnd
                          )}
                        </Badge>
                      </td>
                      <td>
                        {formatAmount(
                          subscriber.subscription?.unitAmount,
                          subscriber.subscription?.currency
                        )}
                      </td>
                      <td>{formatDate(subscriber.subscription?.currentPeriodEnd)}</td>
                      <td>
                        <button
                          type="button"
                          className="view-link"
                          onClick={() => openViewModal(subscriber)}
                        >
                          {t("subscribers.viewButton")}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>

          {!tableState.loading && tableState.totalPages > 1 && (
            <div className="pagination-bar">
              <span className="page-info">
                {tableState.page} / {tableState.totalPages}
              </span>
              <div className="d-flex gap-2">
                <Button
                  btnStyle="GO"
                  btnText={t("table.pagination.prev")}
                  disabled={tableState.page <= 1}
                  onClick={() =>
                    setTableState((prev) => ({
                      ...prev,
                      page: Math.max(prev.page - 1, 1),
                    }))
                  }
                />
                <Button
                  btnStyle="GO"
                  btnText={t("table.pagination.next")}
                  disabled={tableState.page >= tableState.totalPages}
                  onClick={() =>
                    setTableState((prev) => ({
                      ...prev,
                      page: Math.min(prev.page + 1, prev.totalPages),
                    }))
                  }
                />
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={cancelState.show}
        onHide={() => setCancelState({ show: false, loading: false, subscriber: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("subscribers.cancelTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("subscribers.cancelMessage")}</Modal.Body>
        <Modal.Footer>
          <Button
            btnStyle="GO"
            btnText={t("subscribers.cancelKeep")}
            onClick={() => setCancelState({ show: false, loading: false, subscriber: null })}
          />
          <Button
            btnStyle="DO"
            btnText={t("subscribers.cancelConfirm")}
            btnLoading={cancelState.loading}
            onClick={handleCancelSubscription}
          />
        </Modal.Footer>
      </Modal>

      <Modal show={viewState.show} onHide={closeViewModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("subscribers.viewTitle")}</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* ================= Provider Table ================= */}
            <div
              style={{
                border: "1px solid #eaeaea",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #eaeaea",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <h6 style={{ margin: 0 }}>
                  {t("subscribers.sectionProvider")}
                </h6>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailName")}
                    </td>
                    <td style={valueCellStyle}>
                      {viewState.subscriber?.name || "-"}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailEmail")}
                    </td>
                    <td style={valueCellStyle}>
                      {viewState.subscriber?.email || "-"}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailLastLogin")}
                    </td>
                    <td style={valueCellStyle}>
                      {formatDate(viewState.subscriber?.lastLogin)}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailCreatedAt")}
                    </td>
                    <td style={valueCellStyle}>
                      {formatDate(viewState.subscriber?.createdAt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ================= Subscription Table ================= */}
            <div
              style={{
                border: "1px solid #eaeaea",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #eaeaea",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <h6 style={{ margin: 0 }}>
                  {t("subscribers.sectionSubscription")}
                </h6>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailStatus")}
                    </td>
                    <td style={valueCellStyle}>
                      {getStatusLabel(
                        viewState.subscriber?.subscription?.status,
                        viewState.subscriber?.subscription?.cancelAtPeriodEnd
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailPlan")}
                    </td>
                    <td style={valueCellStyle}>
                      {formatAmount(
                        viewState.subscriber?.subscription?.unitAmount,
                        viewState.subscriber?.subscription?.currency
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailNextBilling")}
                    </td>
                    <td style={valueCellStyle}>
                      {formatDate(
                        viewState.subscriber?.subscription?.currentPeriodEnd
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailTrialEnd")}
                    </td>
                    <td style={valueCellStyle}>
                      {formatDate(
                        viewState.subscriber?.subscription?.trialEnd
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailCancelAtPeriodEnd")}
                    </td>
                    <td style={valueCellStyle}>
                      {viewState.subscriber?.subscription?.cancelAtPeriodEnd
                        ? t("subscribers.yes")
                        : t("subscribers.no")}
                    </td>
                  </tr>

                  <tr>
                    <td style={labelCellStyle}>
                      {t("subscribers.detailPaymentStatus")}
                    </td>
                    <td style={valueCellStyle}>
                      {viewState.subscriber?.subscription?.latestPaymentStatus || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #eaeaea",
                  textAlign: "right",
                }}
              >
                <Button
                  btnStyle="DO"
                  btnText={t("subscribers.cancelButton")}
                  disabled={viewState.subscriber?.subscription?.cancelAtPeriodEnd}
                  onClick={() => {
                    if (viewState.subscriber) {
                      openCancelModal(viewState.subscriber);
                      closeViewModal();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>


    </Container>
  );
};

export default Subscribers;
