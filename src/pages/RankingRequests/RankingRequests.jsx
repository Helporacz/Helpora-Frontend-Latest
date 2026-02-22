import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import UserProfileLayout from "components/layouts/UserProfileLayout";
import {
  deleteAdminRankingRequest,
  getAdminRankingRequests,
  reviewAdminRankingRequest,
  throwError,
  throwSuccess,
} from "store/globalSlice";

const STATUS_OPTIONS = ["pending", "approved", "denied"];
const STATUS_STYLES = {
  pending:
    "tw-bg-amber-100 tw-text-amber-700 tw-ring-1 tw-ring-inset tw-ring-amber-200",
  approved:
    "tw-bg-emerald-100 tw-text-emerald-700 tw-ring-1 tw-ring-inset tw-ring-emerald-200",
  denied:
    "tw-bg-rose-100 tw-text-rose-700 tw-ring-1 tw-ring-inset tw-ring-rose-200",
};

const RankingRequests = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const locale =
    i18n.resolvedLanguage?.startsWith("cs") || i18n.resolvedLanguage?.startsWith("cz")
      ? "cs-CZ"
      : i18n.resolvedLanguage?.startsWith("ru")
      ? "ru-RU"
      : "en-US";

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
  const [actionLoading, setActionLoading] = useState({});
  const [approveModal, setApproveModal] = useState({
    show: false,
    provider: null,
    ranking_position: "",
    rank_badge_label: "",
    ranking_start_at: "",
    ranking_end_at: "",
    admin_note: "",
    saving: false,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(tableState.search);
    }, 350);
    return () => clearTimeout(handler);
  }, [tableState.search]);

  useEffect(() => {
    setTableState((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, tableState.status, tableState.limit]);

  const fetchRequests = useCallback(async () => {
    setTableState((prev) => ({ ...prev, loading: true }));
    const params = {
      page: tableState.page,
      limit: tableState.limit,
      search: debouncedSearch,
      status: tableState.status,
    };

    const res = await dispatch(getAdminRankingRequests(params));
    if (res?.success) {
      setTableState((prev) => ({
        ...prev,
        data: Array.isArray(res.data) ? res.data : [],
        total: Number(res.total) || 0,
        totalPages: Number(res.totalPages) || 1,
        loading: false,
      }));
      return;
    }

    setTableState((prev) => ({ ...prev, loading: false }));
    dispatch(
      throwError(res?.message || t("rankingRequests.messages.loadFailed"))
    );
  }, [
    dispatch,
    tableState.page,
    tableState.limit,
    tableState.status,
    debouncedSearch,
    t,
  ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDateTime = useCallback(
    (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "-";
      return date.toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [locale]
  );

  const getStatusLabel = useCallback(
    (status) => {
      const normalized = STATUS_OPTIONS.includes(status) ? status : "pending";
      return t(`rankingRequests.status.${normalized}`);
    },
    [t]
  );

  const getStatusStyle = useCallback((status) => {
    const normalized = STATUS_OPTIONS.includes(status) ? status : "pending";
    return STATUS_STYLES[normalized] || STATUS_STYLES.pending;
  }, []);

  const closeApproveModal = () => {
    setApproveModal({
      show: false,
      provider: null,
      ranking_position: "",
      rank_badge_label: "",
      ranking_start_at: "",
      ranking_end_at: "",
      admin_note: "",
      saving: false,
    });
  };

  const openApproveModal = (provider) => {
    const toDateTimeLocal = (value) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };
    const currentRankPosition = Number(provider?.ranking_position);
    const preferredRankPosition = Number(
      provider?.ranking_request?.preferred_position
    );

    setApproveModal({
      show: true,
      provider,
      ranking_position:
        Number.isInteger(currentRankPosition) && currentRankPosition > 0
          ? String(currentRankPosition)
          : Number.isInteger(preferredRankPosition) && preferredRankPosition > 0
          ? String(preferredRankPosition)
          : "",
      rank_badge_label: provider?.rank_badge_label || "",
      ranking_start_at: toDateTimeLocal(
        provider?.ranking_start_at || provider?.ranking_request?.preferred_start_at
      ),
      ranking_end_at: toDateTimeLocal(
        provider?.ranking_end_at || provider?.ranking_request?.preferred_end_at
      ),
      admin_note: "",
      saving: false,
    });
  };

  const handleReview = async (providerId, action, payload = {}) => {
    if (!providerId || !["approve", "deny"].includes(action)) return;
    setActionLoading((prev) => ({ ...prev, [providerId]: action }));

    const res = await dispatch(
      reviewAdminRankingRequest(providerId, { action, ...payload })
    );
    if (res?.success) {
      dispatch(
        throwSuccess(
          action === "approve"
            ? t("rankingRequests.messages.approveSuccess")
            : t("rankingRequests.messages.denySuccess")
        )
      );
      await fetchRequests();
      setActionLoading((prev) => ({ ...prev, [providerId]: null }));
      return true;
    } else {
      dispatch(
        throwError(res?.message || t("rankingRequests.messages.actionFailed"))
      );
      setActionLoading((prev) => ({ ...prev, [providerId]: null }));
      return false;
    }
  };

  const handleDeleteDeniedRequest = async (providerId) => {
    if (!providerId) return;
    const confirmed = window.confirm(
      t("rankingRequests.messages.deleteConfirm")
    );
    if (!confirmed) return;

    setActionLoading((prev) => ({ ...prev, [providerId]: "delete" }));
    const res = await dispatch(deleteAdminRankingRequest(providerId));
    if (res?.success) {
      dispatch(throwSuccess(t("rankingRequests.messages.deleteSuccess")));
      await fetchRequests();
      setActionLoading((prev) => ({ ...prev, [providerId]: null }));
      return;
    }

    dispatch(
      throwError(res?.message || t("rankingRequests.messages.deleteFailed"))
    );
    setActionLoading((prev) => ({ ...prev, [providerId]: null }));
  };

  const submitApproveModal = async () => {
    const providerId = approveModal?.provider?._id;
    if (!providerId) return;

    const position = Number(approveModal.ranking_position);
    if (!Number.isInteger(position) || position <= 0) {
      dispatch(throwError(t("rankingRequests.messages.rankPositionRequired")));
      return;
    }

    const parseDateValue = (value) => {
      if (!value) return null;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;
      return parsed;
    };

    const startAt = parseDateValue(approveModal.ranking_start_at);
    const endAt = parseDateValue(approveModal.ranking_end_at);
    if (startAt && endAt && startAt > endAt) {
      dispatch(throwError(t("rankingRequests.messages.invalidDateRange")));
      return;
    }

    setApproveModal((prev) => ({ ...prev, saving: true }));
    const payload = {
      ranking_position: position,
      rank_badge_label: approveModal.rank_badge_label || "",
      ranking_start_at: approveModal.ranking_start_at || "",
      ranking_end_at: approveModal.ranking_end_at || "",
      admin_note: approveModal.admin_note || "",
    };

    const success = await handleReview(providerId, "approve", payload);
    setApproveModal((prev) => ({ ...prev, saving: false }));
    if (success) {
      closeApproveModal();
    }
  };

  const pageInfo = useMemo(() => {
    const start = tableState.total === 0 ? 0 : (tableState.page - 1) * tableState.limit + 1;
    const end = Math.min(tableState.total, tableState.page * tableState.limit);
    return { start, end };
  }, [tableState.page, tableState.limit, tableState.total]);

  return (
    <div className="tw-min-h-screen tw-bg-slate-100 tw-p-4 md:tw-p-8">
      <div className="tw-mb-5">
        <h2 className="tw-text-2xl tw-font-bold tw-text-slate-900 md:tw-text-3xl">
          {t("rankingRequests.title")}
        </h2>
        <p className="tw-mt-1 tw-text-sm tw-text-slate-600 md:tw-text-base">
          {t("rankingRequests.subtitle")}
        </p>
      </div>

      <section className="tw-overflow-hidden tw-rounded-2xl tw-bg-white tw-shadow-sm tw-ring-1 tw-ring-slate-200">
        <header className="tw-flex tw-flex-col tw-gap-4 tw-border-b tw-border-slate-200 tw-bg-slate-50 tw-p-4 md:tw-flex-row md:tw-items-end md:tw-justify-between md:tw-p-5">
          <div>
            <h5 className="tw-mb-1 tw-text-lg tw-font-semibold tw-text-slate-900">
              {t("rankingRequests.title")}
            </h5>
            <small className="tw-text-sm tw-text-slate-500">
              {t("table.pagination.results")} {tableState.total}
            </small>
          </div>

          <div className="tw-grid tw-grid-cols-1 tw-gap-3 md:tw-grid-cols-[minmax(280px,1fr)_180px_120px] md:tw-items-center">
            <input
              type="text"
              placeholder={t("rankingRequests.searchPlaceholder")}
              value={tableState.search}
              onChange={(e) =>
                setTableState((prev) => ({ ...prev, search: e.target.value }))
              }
              className="tw-h-11 tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-text-sm tw-text-slate-700 tw-shadow-sm tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
            />
            <select
              className="tw-h-11 tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-700 tw-shadow-sm tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
              value={tableState.status}
              onChange={(e) =>
                setTableState((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">{t("rankingRequests.filter.all")}</option>
              <option value="pending">{t("rankingRequests.filter.pending")}</option>
              <option value="approved">{t("rankingRequests.filter.approved")}</option>
              <option value="denied">{t("rankingRequests.filter.denied")}</option>
            </select>
            <select
              className="tw-h-11 tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-700 tw-shadow-sm tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
              value={tableState.limit}
              onChange={(e) =>
                setTableState((prev) => ({
                  ...prev,
                  limit: Number(e.target.value) || 10,
                }))
              }
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </header>

        <div className="tw-p-4 md:tw-p-5">
          <div className="tw-overflow-x-auto tw-rounded-xl tw-border tw-border-slate-200">
            <table className="tw-min-w-full tw-border-separate tw-border-spacing-0">
              <thead className="tw-sticky tw-top-0 tw-z-10 tw-bg-slate-50">
                <tr>
                  <th className="tw-whitespace-nowrap tw-border-b tw-border-slate-200 tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-600">
                    {t("rankingRequests.table.provider")}
                  </th>
                  <th className="tw-whitespace-nowrap tw-border-b tw-border-slate-200 tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-600">
                    {t("rankingRequests.table.requestStatus")}
                  </th>
                  <th className="tw-whitespace-nowrap tw-border-b tw-border-slate-200 tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-600">
                    {t("rankingRequests.table.requestedAt")}
                  </th>
                  <th className="tw-whitespace-nowrap tw-border-b tw-border-slate-200 tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-600">
                    {t("rankingRequests.table.currentRank")}
                  </th>
                  <th className="tw-whitespace-nowrap tw-border-b tw-border-slate-200 tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-600">
                    {t("rankingRequests.table.requestNote")}
                  </th>
                  <th className="tw-whitespace-nowrap tw-border-b tw-border-slate-200 tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-600">
                    {t("rankingRequests.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableState.loading && (
                  <tr>
                    <td colSpan={6} className="tw-py-10 tw-text-center">
                      <div className="spinner-border tw-text-brand-green" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!tableState.loading && tableState.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="tw-py-8 tw-text-center tw-text-sm tw-text-slate-500">
                      {t("rankingRequests.noData")}
                    </td>
                  </tr>
                )}

                {!tableState.loading &&
                  tableState.data.map((item) => {
                    const requestStatus =
                      item?.ranking_request?.status || "pending";
                    const isPending = requestStatus === "pending";
                    const isDenied = requestStatus === "denied";
                    const activeAction = actionLoading[item._id];
                    const actionBusy = !!activeAction;

                    return (
                      <tr
                        key={item._id}
                        className="tw-border-b tw-border-slate-100 last:tw-border-b-0 hover:tw-bg-slate-50"
                      >
                        <td className="tw-px-4 tw-py-3.5">
                          <div className="tw-flex tw-items-center tw-gap-3">
                            <UserProfileLayout isSquare size="40" url={item?.profileImage} />
                            <div>
                              <div className="tw-text-sm tw-font-semibold tw-text-slate-900">
                                {item?.name || "-"}
                              </div>
                              <div className="tw-text-xs tw-text-slate-500">
                                {item?.email || "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="tw-px-4 tw-py-3.5">
                          <span
                            className={`tw-inline-flex tw-items-center tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold ${getStatusStyle(
                              requestStatus
                            )}`}
                          >
                            {getStatusLabel(requestStatus)}
                          </span>
                        </td>

                        <td className="tw-whitespace-nowrap tw-px-4 tw-py-3.5 tw-text-sm tw-text-slate-700">
                          {formatDateTime(item?.ranking_request?.requested_at)}
                        </td>

                        <td className="tw-px-4 tw-py-3.5">
                          {item?.is_ranked && Number(item?.ranking_position) > 0
                            ? (
                              <span className="tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold tw-text-slate-700 tw-ring-1 tw-ring-inset tw-ring-slate-200">
                                #{item.ranking_position}
                              </span>
                            )
                            : (
                              <span className="tw-text-sm tw-text-slate-500">
                                {t("rankingRequests.notRanked")}
                              </span>
                            )}
                        </td>

                        <td className="tw-max-w-[340px] tw-break-words tw-px-4 tw-py-3.5 tw-text-sm tw-text-slate-700">
                          {item?.ranking_request?.message ||
                            item?.ranking_request?.admin_note ||
                            "-"}
                        </td>

                        <td className="tw-px-4 tw-py-3.5">
                          {isPending ? (
                            <div className="tw-flex tw-flex-wrap tw-gap-2">
                              <button
                                type="button"
                                disabled={actionBusy}
                                onClick={() => openApproveModal(item)}
                                className="tw-inline-flex tw-items-center tw-rounded-lg tw-bg-emerald-600 tw-px-3 tw-py-1.5 tw-text-xs tw-font-semibold tw-text-white tw-transition hover:tw-bg-emerald-700 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
                              >
                                {activeAction === "approve"
                                  ? t("rankingRequests.actions.approving")
                                  : t("rankingRequests.actions.approve")}
                              </button>
                              <button
                                type="button"
                                disabled={actionBusy}
                                onClick={() => handleReview(item._id, "deny")}
                                className="tw-inline-flex tw-items-center tw-rounded-lg tw-border tw-border-rose-300 tw-bg-white tw-px-3 tw-py-1.5 tw-text-xs tw-font-semibold tw-text-rose-700 tw-transition hover:tw-bg-rose-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
                              >
                                {activeAction === "deny"
                                  ? t("rankingRequests.actions.denying")
                                  : t("rankingRequests.actions.deny")}
                              </button>
                            </div>
                          ) : isDenied ? (
                            <div className="tw-flex tw-flex-wrap tw-gap-2">
                              <button
                                type="button"
                                disabled={actionBusy}
                                onClick={() => handleDeleteDeniedRequest(item._id)}
                                className="tw-inline-flex tw-items-center tw-rounded-lg tw-border tw-border-rose-300 tw-bg-white tw-px-3 tw-py-1.5 tw-text-xs tw-font-semibold tw-text-rose-700 tw-transition hover:tw-bg-rose-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
                              >
                                {activeAction === "delete"
                                  ? t("rankingRequests.actions.deleting")
                                  : t("rankingRequests.actions.delete")}
                              </button>
                            </div>
                          ) : (
                            <span className="tw-text-sm tw-text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {!tableState.loading && tableState.total > 0 && (
            <div className="tw-mt-4 tw-flex tw-flex-col tw-gap-3 md:tw-flex-row md:tw-items-center md:tw-justify-between">
              <div className="tw-text-sm tw-font-semibold tw-text-slate-700">
                {pageInfo.start}-{pageInfo.end} / {tableState.total}
              </div>
              <div className="tw-inline-flex tw-items-center tw-gap-2">
                <button
                  type="button"
                  disabled={tableState.page <= 1}
                  onClick={() =>
                    setTableState((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  className="tw-inline-flex tw-items-center tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition hover:tw-bg-slate-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                >
                  {t("table.pagination.prev")}
                </button>
                <div className="tw-inline-flex tw-min-w-[88px] tw-items-center tw-justify-center tw-rounded-lg tw-bg-slate-100 tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-slate-700 tw-ring-1 tw-ring-inset tw-ring-slate-200">
                  {tableState.page} / {tableState.totalPages}
                </div>
                <button
                  type="button"
                  disabled={tableState.page >= tableState.totalPages}
                  onClick={() =>
                    setTableState((prev) => ({
                      ...prev,
                      page: Math.min(prev.totalPages, prev.page + 1),
                    }))
                  }
                  className="tw-inline-flex tw-items-center tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition hover:tw-bg-slate-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                >
                  {t("table.pagination.next")}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Modal
        centered
        show={approveModal.show}
        onHide={closeApproveModal}
        dialogClassName="tw-max-w-3xl"
        contentClassName="tw-overflow-hidden tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-2xl"
      >
        <Modal.Header closeButton className="tw-border-b tw-border-slate-200 tw-bg-slate-50">
          <Modal.Title className="tw-text-lg tw-font-semibold tw-text-slate-900">
            {t("rankingRequests.approveModal.title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="tw-p-5 md:tw-p-6">
          <p className="tw-mb-4 tw-text-sm tw-text-slate-600">
            {t("rankingRequests.approveModal.subtitle", {
              name: approveModal?.provider?.name || "-",
            })}
          </p>

          <div className="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
            <div>
              <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("addProvider.rankingPosition")}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={approveModal.ranking_position}
                onChange={(event) =>
                  setApproveModal((prev) => ({
                    ...prev,
                    ranking_position: event.target.value,
                  }))
                }
                placeholder={t("addProvider.rankingPositionPlaceholder")}
                className="tw-h-11 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-700 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>

            <div>
              <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("addProvider.rankBadgeLabel")}
              </label>
              <input
                type="text"
                value={approveModal.rank_badge_label}
                onChange={(event) =>
                  setApproveModal((prev) => ({
                    ...prev,
                    rank_badge_label: event.target.value,
                  }))
                }
                placeholder={t("addProvider.rankBadgeLabelPlaceholder")}
                className="tw-h-11 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-700 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>

            <div>
              <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("addProvider.rankingStartAt")}
              </label>
              <input
                type="datetime-local"
                value={approveModal.ranking_start_at}
                onChange={(event) =>
                  setApproveModal((prev) => ({
                    ...prev,
                    ranking_start_at: event.target.value,
                  }))
                }
                className="tw-h-11 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-700 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>

            <div>
              <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("addProvider.rankingEndAt")}
              </label>
              <input
                type="datetime-local"
                value={approveModal.ranking_end_at}
                onChange={(event) =>
                  setApproveModal((prev) => ({
                    ...prev,
                    ranking_end_at: event.target.value,
                  }))
                }
                className="tw-h-11 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-700 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>

            <div className="md:tw-col-span-2">
              <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("rankingRequests.approveModal.adminNote")}
              </label>
              <textarea
                rows={3}
                value={approveModal.admin_note}
                onChange={(event) =>
                  setApproveModal((prev) => ({
                    ...prev,
                    admin_note: event.target.value,
                  }))
                }
                placeholder={t("rankingRequests.approveModal.adminNotePlaceholder")}
                className="tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2.5 tw-text-sm tw-text-slate-700 tw-outline-none tw-transition focus:tw-border-brand-green focus:tw-ring-2 focus:tw-ring-brand-green/20"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="tw-gap-2 tw-border-t tw-border-slate-200 tw-bg-white">
          <button
            type="button"
            onClick={closeApproveModal}
            className="tw-inline-flex tw-items-center tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-slate-700 tw-transition hover:tw-bg-slate-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={approveModal.saving}
            onClick={submitApproveModal}
            className="tw-inline-flex tw-items-center tw-rounded-xl tw-bg-emerald-600 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-emerald-700 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
          >
            {approveModal.saving
              ? t("rankingRequests.approveModal.saving")
              : t("rankingRequests.approveModal.confirm")}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RankingRequests;
