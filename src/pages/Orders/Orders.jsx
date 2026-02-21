import { useCallback, useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import { useDispatch } from "react-redux";
import SearchInput from "components/form/SearchInput";
import MenuOption from "components/layouts/MenuOption";
import Table from "components/layouts/Table/Table";
import UpdateBookingStatusModal from "./UpdateBookingStatusModal";

import { getBookings, throwSuccess, updateBookingStatus } from "store/globalSlice";
import { useTranslation } from "react-i18next";

const Orders = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";
  const [tableData, setTableData] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    search: "",
    loading: true,
    data: [],
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [buttonText, setButtonText] = useState("Filter By");

  const statusOptions = ["All", "pending", "accepted", "completed", "rejected"];

  const statusColors = {
    rejected: "danger",
    accepted: "success",
    completed: "info",
    pending: "warning",
  };

  const fetchTableData = useCallback(async () => {
    setTableData((prev) => ({ ...prev, loading: true }));

    try {
      const res = await dispatch(getBookings());
      let data = res?.data || [];

      if (tableData.search) {
        const search = tableData.search.toLowerCase();
        data = data.filter(
          (item) =>
            item.service?.title?.toLowerCase().includes(search) ||
            item.user?.name?.toLowerCase().includes(search)
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

  const handleStatusClick = (booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  const handleStatusSelect = (status) => {
    setStatusFilter(status === "All" ? "" : status);
    setButtonText(status);
    setTableData((prev) => ({ ...prev, offset: 0 }));
  };

  const handleStatusSubmit = async (formData) => {
    if (!selectedBooking) return;

    try {
      await dispatch(
        updateBookingStatus({
          id: selectedBooking._id,
          data: formData,
        })
      );

      dispatch(throwSuccess(t("messages.bookingStatusUpdatedSuccessfully")));
      setShowStatusModal(false);
      fetchTableData();
    } catch (error) {
      console.error(error);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const header = [
    { title: t("order.table.header1") },
    { title: t("order.table.header3") },
    { title: t("order.table.header4") },
    { title: t("order.table.header2") },
    { title: t("order.table.header6") },
    { title: t("order.table.header7") },
  ];

  const rowData = tableData.data?.map((item) => {
    return {
      data: [
        { value: item.service?.title || "-" },
        { value: item.user?.name ?? "-" },
        {
          value: (
            <Badge
              bg={statusColors[item.status] || "secondary"}
              className="px-3 py-2"
              style={{ fontSize: "14px", cursor: "pointer", color:"white" }}
              onClick={() => handleStatusClick(item)}
            >
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
            </Badge>
          ),
        },
        { value: `CZK${item.totalPrice}` ?? `CZK${item.service?.price}` ?? "-" },
        { value: formatDate(item.bookingDate) },
        { value: formatDateTime(item.updatedAt) },
      ],
    };
  }) || [];

  return (
    <div id="my-services-container" className="mt-3">
      <div className="services-header-block">
        <div className="content-block">
          <div className="title-value-block d-flex align-items-center gap-2 mb-3">
            <div className="text-20-700 color-black-100">{t("order.heading")}</div>
            <div className="value-block text-13-600 color-dashboard-primary">
              {tableData.total}
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-3">
              <MenuOption
                icon={<button className="border px-3 py-2" style={{ margin: "0px" }}>{buttonText} Status</button>}
                option={statusOptions.map((status) => ({
                  text: status.charAt(0).toUpperCase() + status.slice(1),
                  onClick: () => handleStatusSelect(status),
                }))}
              />
            <SearchInput
              placeholder={t("order.searchbarPlaceholder")}
              value={tableData.search}
              onChange={(e) =>
                setTableData((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
        </div>

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

        {showStatusModal && selectedBooking && (
          <UpdateBookingStatusModal
            show={showStatusModal}
            onHide={() => setShowStatusModal(false)}
            booking={selectedBooking}
            onSubmit={handleStatusSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
