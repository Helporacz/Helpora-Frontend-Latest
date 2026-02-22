import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput";
import Table from "components/layouts/Table/Table";
import UserProfileLayout from "components/layouts/UserProfileLayout";
import {
  getAllClient,
  getClientEmailsForExportData,
  deleteClient,
  throwSuccess,
  throwError,
} from "store/globalSlice";
import { useTranslation } from "react-i18next";
import { titleCaseString } from "utils/helpers";
import { buildCsv, downloadCsv } from "utils/csvExport";

const ViewClients = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [tableData, setTableData] = useState({
    offset: 0,
    limit: 10,
    intervalLimit: 10,
    total: 0,
    search: "",
    status: "",
    type: "",
    loading: true,
    data: [],
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isExportingEmails, setIsExportingEmails] = useState(false);

  const fetchTableData = useCallback(async () => {
    try {
      const response = await dispatch(getAllClient());
      const allData = response?.allClients?.map((o) => ({ ...o })) || [];

      const filteredData = allData.filter((client) => {
        const search = tableData.search.trimEnd().toLowerCase();
        return (
          client.name?.toLowerCase().includes(search) ||
          client.email?.toLowerCase().includes(search)
        );
      });

      setTableData((prev) => ({
        ...prev,
        data: filteredData,
        total: filteredData.length,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching clients:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search]);

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsSuperAdmin(role === "superAdmin");
  }, []);

  const formatCsvDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  };

  const handleExportClientEmails = async () => {
    if (!isSuperAdmin || isExportingEmails) return;
    setIsExportingEmails(true);
    try {
      const response = await dispatch(getClientEmailsForExportData());
      if (response?.status && response.status !== 200) {
        dispatch(
          throwError(
            response?.message ||
              t("client.export.error", "Failed to export client emails.")
          )
        );
        return;
      }
      const rows = Array.isArray(response?.rows) ? response.rows : [];

      if (!rows.length) {
        dispatch(
          throwError(t("client.export.empty", "No client emails found to export."))
        );
        return;
      }

      const headers = [
        t("client.export.columns.name", "Name"),
        t("client.export.columns.email", "Email"),
        t("client.export.columns.phone", "Phone"),
        t("client.export.columns.status", "Status"),
        t("client.export.columns.createdAt", "Created At"),
        t("client.export.columns.lastLogin", "Last Login"),
      ];

      const csvRows = rows.map((row) => [
        row?.name || "",
        row?.email || "",
        row?.phoneNumber || "",
        row?.isActive
          ? t("providers.table.active", "Active")
          : t("providers.table.suspend", "Suspend"),
        formatCsvDate(row?.createdAt),
        formatCsvDate(row?.lastLogin),
      ]);

      const csvContent = buildCsv(headers, csvRows);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      downloadCsv(`clients-emails-${timestamp}.csv`, csvContent);

      dispatch(
        throwSuccess(t("client.export.success", "Client emails CSV downloaded."))
      );
    } catch (error) {
      console.error("Error exporting client emails:", error);
      dispatch(
        throwError(t("client.export.error", "Failed to export client emails."))
      );
    } finally {
      setIsExportingEmails(false);
    }
  };

  const header = [
    { title: t("client.table.header1") },
    { title: t("client.table.header2") },
    { title: t("client.table.header3") },
    { title: t("client.table.header4") },
    { title: t("client.table.header5") },
    { title: t("client.table.header6") },
    { title: t("client.table.header7", "Actions") },
  ];

  const rowData =
    tableData?.data?.map((client) => {
      const {
        name,
        email,
        phoneNumber,
        profileImage,
        completedOrders,
        totalSpendAmount,
        lastLogin,
      } = client;

      const action = isSuperAdmin ? (
        <button
          className="btn btn-sm btn-danger"
          onClick={async () => {
            if (
              window.confirm(
                t("client.deleteConfirm", "Delete this client?")
              )
            ) {
              const response = await dispatch(deleteClient(client._id));
              if (response?.status === 200) {
                dispatch(
                  throwSuccess(
                    t("client.deleteSuccess", "Client removed successfully.")
                  )
                );
                fetchTableData();
              } else {
                dispatch(
                  throwError(
                    response?.data?.message ||
                      t("client.deleteError", "Failed to delete client.")
                  )
                );
              }
            }
          }}
        >
          {t("client.deleteAction", "Delete")}
        </button>
      ) : (
        "-"
      );

      return {
        data: [
          {
            value: (
              <div className="d-flex align-items-center gap-3">
                <UserProfileLayout isSquare url={profileImage} size="40" />
                <div className="pointer">
                  <div className="text-13-500-21 color-black-100">
                    {titleCaseString(name || "Client Name")}
                  </div>
                </div>
              </div>
            ),
          },
          { value: email || "-" },
          { value: phoneNumber || "-" },
          { value: completedOrders || "0" },
          { value: `CZK${totalSpendAmount}` || "0" },
            { value: formatDateTime(lastLogin) || "-" },
            { value: action },
          ],
        };
    }) || [];

  return (
    <div id="providers-container" className="mt-3">
      <div className="providers-header-block">
        <div className="content-block cps-10 cpt-24 cpe-24">
          <div className="title-value-block d-flex align-items-center gap-2 cmb-24">
            <div className="text-20-700 color-black-100">
              {t("client.heading")}
            </div>
            <div className="value-block text-13-600 color-dashboard-primary cpt-2 cpe-6 cpb-2 cps-6">
              {tableData?.total}
            </div>
          </div>

          <div className="header-buttons-block d-flex justify-content-between gap-2 flex-wrap cmb-20">
            <SearchInput
              placeholder={t("client.searchbarPlaceholder")}
              value={tableData.search}
              onChange={(e) =>
                setTableData((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            {isSuperAdmin && (
              <Button
                btnText={t("client.export.button", "Export Emails CSV")}
                btnStyle="BO"
                iconType="L-Download"
                onClick={handleExportClientEmails}
                btnLoading={isExportingEmails}
                disabled={isExportingEmails}
              />
            )}
          </div>
        </div>

        <div className="overflow-auto">
          <Table
            header={header}
            rowData={rowData}
            isLoading={tableData.loading}
            tableData={tableData}
            changeOffset={(newOffset, newLimit = tableData.limit) => {
              const updated = {
                ...tableData,
                offset: newOffset,
                limit: newLimit,
                loading: true,
              };
              setTableData(updated);
              fetchTableData(updated);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewClients;
