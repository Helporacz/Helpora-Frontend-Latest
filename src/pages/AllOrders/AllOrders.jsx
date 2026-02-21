import { useCallback, useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import SearchInput from "components/form/SearchInput";
import MenuOption from "components/layouts/MenuOption";
import Table from "components/layouts/Table/Table";
import { getAllBookings } from "store/globalSlice";


const AllOrders = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [tableData, setTableData] = useState({
        offset: 0,
        limit: 10,
        total: 0,
        search: "",
        loading: true,
        data: [],
    });

    const [statusFilter, setStatusFilter] = useState("");
    const [buttonText, setButtonText] = useState(t("common.filterBy"));

    const statusOptions = [
      { value: "all", label: t("common.all") },
      { value: "pending", label: t("common.pending") },
      { value: "accepted", label: t("common.accepted") },
      { value: "completed", label: t("common.completed") },
      { value: "rejected", label: t("common.rejected") }
    ];

    const statusColors = {
        rejected: "danger",
        accepted: "success",
        completed: "info",
        pending: "warning",
    };

    const fetchTableData = useCallback(async () => {
        setTableData((prev) => ({ ...prev, loading: true }));
        try {
            const res = await dispatch(getAllBookings());
            let data = res?.bookings || [];

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

    const handleStatusSelect = (status) => {
        if (typeof status === "object") {
            setStatusFilter(status.value === "all" ? "" : status.value);
            setButtonText(status.label);
        } else {
            // Backward compatibility
            const option = statusOptions.find(opt => opt.value === status || opt.label === status);
            if (option) {
                setStatusFilter(option.value === "all" ? "" : option.value);
                setButtonText(option.label);
            } else {
                setStatusFilter(status === "All" || status === t("common.all") ? "" : status);
                setButtonText(status);
            }
        }
        setTableData((prev) => ({ ...prev, offset: 0 }));
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
        { title: t("allOrder.table.header1") },
        { title: t("allOrder.table.header2") },
        { title: t("allOrder.table.header4") },
        { title: t("allOrder.table.header5") },
        { title: t("allOrder.table.header8") },
        { title: t("allOrder.table.header6") },
        { title: t("allOrder.table.header7") },
    ];

    const rowData = tableData.data?.map((item) => {
        return {
            data: [
                { value: item.service?.title || "-" },
                { value: `CZK${item.totalPrice}` ?? `CZK${item.service?.price}` ?? "-" },
                {
                    value: (
                        <Badge
                            bg={statusColors[item.status] || "secondary"}
                            className="px-3 py-2"
                            style={{ fontSize: "14px", cursor: "pointer", color:"white" }}
                        >
                            {item.status ? t(`common.${item.status}`) : "-"}
                        </Badge>
                    ),
                },
                { value: item.provider?.name ?? "-" },
                { value: item.user?.name ?? "-" },
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
                        <div className="text-20-700 color-black-100">Total Orders</div>
                        <div className="value-block text-13-600 color-dashboard-primary">
                            {tableData.total}
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <MenuOption
                            icon={<button className="border px-3 py-2" style={{ margin: "0px" }}>{buttonText} {t("common.status")}</button>}
                            option={statusOptions.map((status) => ({
                                text: status.label,
                                onClick: () => handleStatusSelect(status),
                            }))}
                        />
                        <SearchInput
                            placeholder="Search Orders"
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
            </div>
        </div>
    );
};

export default AllOrders;

