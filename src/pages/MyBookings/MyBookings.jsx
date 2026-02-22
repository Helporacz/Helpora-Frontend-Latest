import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import SearchInput from "components/form/SearchInput";
import MenuOption from "components/layouts/MenuOption";
import Table from "components/layouts/Table/Table";
import { Badge, Modal, Button } from "react-bootstrap";
import { getUserBookings, addReview, getAllReview, throwSuccess, createBooking } from "store/globalSlice";
import { useTranslation } from "react-i18next";
import { commonRoute } from "utils/constants";
import { getLocalizedPath } from "utils/localizedRoute";

const MyBookings = () => {
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [tableData, setTableData] = useState({
        offset: 0,
        limit: 10,
        total: 0,
        search: "",
        loading: true,
        data: [],
    });

    const [buttonText, setButtonText] = useState("Filter By");
  const [statusFilter, setStatusFilter] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [reviewedServiceIds, setReviewedServiceIds] = useState(new Set());
  const [autoPromptShown, setAutoPromptShown] = useState(false);

    const statusOptions = ["All", "pending", "accepted", "completed", "rejected"];

    const capitalizeFirstLetter = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    const statusColors = {
        rejected: "danger",
        accepted: "success",
        completed: "info",
        pending: "warning",
    };
    // Fetch bookings from API
    const fetchTableData = useCallback(async () => {
      setTableData((prev) => ({ ...prev, loading: true }));

      try {
        const res = await dispatch(getUserBookings());
            let data = res?.data || [];

            if (tableData.search) {
                const search = tableData.search.toLowerCase();
                data = data.filter(
                    (item) =>
                        item.service?.title?.toLowerCase().includes(search) ||
                        (item?.provider?.name?.toLowerCase().includes(search))
                );
            }

            if (statusFilter) {
                data = data.filter((item) => item.status === statusFilter);
            }

            setTableData((prev) => ({
                ...prev,
                data,
                total: data.length,
                loading: false,
            }));
        } catch (error) {
            console.error("Error fetching bookings:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search, statusFilter]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // Fetch existing reviews to hide review button when already reviewed
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await dispatch(getAllReview());
        const reviews = res?.reviews || res?.data?.reviews || [];
        const ids = new Set(
          reviews
            .map((r) => r?.service?._id || r?.service)
            .filter(Boolean)
            .map(String)
        );
        setReviewedServiceIds(ids);
      } catch (err) {
        console.error("Error loading reviews", err);
      }
    };
    loadReviews();
  }, [dispatch]);

    const formatDateTime = (isoString) => (isoString ? new Date(isoString).toLocaleString() : "-");

    const handleStatusSelect = (status) => {
        setStatusFilter(status === "All" ? "" : status);
        setButtonText(capitalizeFirstLetter(status));
        setTableData((prev) => ({ ...prev, offset: 0 }));
    };

    const completedBookings = tableData.data?.filter(
        (b) => b.status?.toLowerCase() === "completed"
    );
    const unreviewedCompleted =
        completedBookings?.filter(
            (b) => !reviewedServiceIds.has(String(b.service?._id))
        ) || [];
    const lastCompletedAt = completedBookings?.length
        ? new Date(
              Math.max(...completedBookings.map((b) => new Date(b.updatedAt || b.createdAt)))
          ).toLocaleString()
        : null;

    // Auto-open review modal for the first unreviewed completed booking (once per visit)
    useEffect(() => {
        if (!autoPromptShown && unreviewedCompleted.length) {
            setSelectedBooking(unreviewedCompleted[0]);
            setReviewForm({ rating: 5, text: "" });
            setShowReviewModal(true);
            setAutoPromptShown(true);
        }
    }, [unreviewedCompleted, autoPromptShown]);

    const header = [
        { title: t("myBooking.table.header1") },
        { title: t("myBooking.table.header2") },
        { title: t("myBooking.table.header3") },
        { title: t("myBooking.table.header4") },
        { title: t("myBooking.table.header5") },
        { title: t("myBooking.table.header6") },
        { title: t("navbar.message", "Message") },
    ];

    const openChatWithProvider = (booking) => {
        const partnerId = booking?.provider?._id || booking?.provider?.id;
        if (!partnerId) return;

        const params = new URLSearchParams({
            partnerId: String(partnerId),
            partnerName: String(booking?.provider?.name || ""),
            partnerImage: String(booking?.provider?.profileImage || ""),
        });

        navigate(
            `${getLocalizedPath(commonRoute.chat, i18n.language)}?${params.toString()}`
        );
    };

    const rowData = tableData.data?.map((item) => ({
        data: [
            { value: item.service?.title || "-" },
            { value: `CZK${item.totalPrice}` ?? "-" },
            {
                value: (
                    <div className="d-flex flex-column gap-1">
                        <Badge
                            bg={statusColors[item.status] || "secondary"}
                            className="px-3 py-2"
                            style={{ fontSize: "14px" }}
                        >
                            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                        </Badge>
                        {item.status?.toLowerCase() === "completed" &&
                          !reviewedServiceIds.has(String(item.service?._id)) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setSelectedBooking(item);
                                setReviewForm({ rating: 5, text: "" });
                                setShowReviewModal(true);
                              }}
                            >
                              {t("myBooking.leaveReview")}
                            </button>
                        )}
                        {item.status?.toLowerCase() === "completed" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={async () => {
                              try {
                                if (!item.providerService && !item.providerServiceId) {
                                  throw new Error("No provider service id on booking");
                                }
                                await dispatch(
                                  createBooking({
                                    providerServiceId: item.providerService || item.providerServiceId,
                                    bookingDate: new Date().toISOString().split("T")[0],
                                    bookingTime: "09:00",
                                    preferredTime: "09:00",
                                    totalPrice: item.totalPrice,
                                    notes: "Repeat booking",
                                  })
                                );
                                dispatch(
                                  throwSuccess(
                                    t("myBooking.repeatSuccess") || "Booking repeated successfully"
                                  )
                                );
                              } catch (err) {
                                console.error("Repeat booking failed", err);
                              }
                            }}
                          >
                            {t("myBooking.bookAgain") || "Book again"}
                          </button>
                        )}
                        {item.status?.toLowerCase() === "completed" &&
                          reviewedServiceIds.has(String(item.service?._id)) && (
                            <Badge bg="secondary" className="px-2 py-1">
                              {t("myBooking.reviewedLabel") || "Reviewed"}
                            </Badge>
                        )}
                    </div>
                ),
            },
            { value: item.provider?.name ?? "-" },
            { value: formatDateTime(item.createdAt) },
            { value: formatDateTime(item.updatedAt) },
            {
                value: (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openChatWithProvider(item)}
                        disabled={!item?.provider?._id}
                    >
                        {t("navbar.message", "Message")}
                    </button>
                ),
            },
        ],
    })) || [];

    return (
        <>
            <div id="my-services-container" className="mt-3 container">
                <div className="services-header-block">
                    {/* Header */}
                    <div className="content-block">
                        <div className="title-value-block d-flex align-items-center gap-2 mb-3">
                            <div className="text-20-700 color-black-100">{t("myBooking.heading")}</div>
                            <div className="value-block text-13-600 color-dashboard-primary">{tableData.total}</div>
                        </div>

                        <div className="header-buttons-block d-flex justify-content-between gap-2 flex-wrap mb-3">
                            <MenuOption
                                icon={
                                    <button className="border px-3 py-2 m-0">
                                        {buttonText} Status
                                    </button>
                                }
                                option={statusOptions.map((status) => ({
                                    text: status.charAt(0).toUpperCase() + status.slice(1),
                                    onClick: () => handleStatusSelect(status),
                                }))}
                            />

                            <SearchInput
                                placeholder={t("myBooking.searchbarPlaceholder")}
                                value={tableData.search}
                                onChange={(e) =>
                                    setTableData((prev) => ({ ...prev, search: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto">
                        <Table
                            header={header}
                            rowData={rowData}
                            isLoading={tableData.loading}
                            tableData={tableData}
                            changeOffset={(newOffset, newLimit = tableData.limit) => {
                                setTableData((prev) => ({
                                    ...prev,
                                    offset: newOffset,
                                    limit: newLimit,
                                }));
                                fetchTableData();
                            }}
                        />
                    </div>

                    {/* Review prompt (UI-only) */}
                    <div className="card mt-3 p-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                            <div>
                                <div className="text-16-700">
                                    {t("myBooking.reviewPromptTitle") ||
                                        "Share feedback for your completed jobs"}
                                </div>
                                <div className="text-14-500 text-muted">
                                    {completedBookings?.length
                                        ? ((t("myBooking.reviewPromptBodyWithDate") ||
                                              "Your most recent completed booking was on") +
                                          " " +
                                          (lastCompletedAt || ""))
                                        : t("myBooking.reviewPromptBody") ||
                                          "Once a job is marked completed, we’ll prompt you to leave a review so others can trust real experiences."}
                                </div>
                            </div>
                            <button
                                className="btn btn-primary mt-2 mt-md-0"
                                type="button"
                                disabled={!unreviewedCompleted.length}
                                onClick={() => {
                                    if (!unreviewedCompleted.length) return;
                                    setSelectedBooking(unreviewedCompleted[0]);
                                    setReviewForm({ rating: 5, text: "" });
                                    setShowReviewModal(true);
                                }}
                            >
                                {unreviewedCompleted.length
                                    ? t("myBooking.leaveReview") || "Leave a review"
                                    : t("myBooking.allReviewed") || "All completed bookings reviewed"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {t("myBooking.reviewModalTitle") || "Leave a review"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label">
                            {t("myBooking.reviewRatingLabel") || "Rating"}
                        </label>
                        <select
                            className="form-control"
                            value={reviewForm.rating}
                            onChange={(e) =>
                                setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                            }
                        >
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                    {r} / 5
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">
                            {t("myBooking.reviewTextLabel") || "Your review"}
                        </label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={reviewForm.text}
                            onChange={(e) =>
                                setReviewForm((prev) => ({ ...prev, text: e.target.value }))
                            }
                            placeholder={
                                t("myBooking.reviewTextPlaceholder") ||
                                "Describe how the job went (UI-only placeholder)"
                            }
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                        {t("common.cancel") || "Cancel"}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (selectedBooking?.service?._id) {
                                const comment = reviewForm.text?.trim() || "";
                                const serviceId = String(selectedBooking.service._id);
                                const reviewerName = selectedBooking?.user?.name || "User";
                                const reviewerImage = selectedBooking?.user?.profileImage || null;
                                const payload = {
                                    name: reviewerName,
                                    cz_name: reviewerName,
                                    rating: reviewForm.rating || 5,
                                    comment: comment || "Review pending",
                                    cz_comment: comment || "Recenze bude doplněna",
                                    service: serviceId,
                                    position: null,
                                    profileImage: reviewerImage,
                                };
                                dispatch(addReview(payload));
                                setReviewedServiceIds((prev) => {
                                    const next = new Set(prev);
                                    next.add(serviceId);
                                    return next;
                                });
                            }
                            setShowReviewModal(false);
                            dispatch(
                                throwSuccess(
                                    t("myBooking.reviewSuccessPlaceholder") ||
                                        "Review captured (UI-only). Thank you!"
                                )
                            );
                        }}
                    >
                        {t("myBooking.reviewSubmit") || "Submit review"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MyBookings;
