import SearchInput from "components/form/SearchInput";
import Table from "components/layouts/Table/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllKycAdmin } from "store/globalSlice";

const KYCApproval = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(true);

  const header = [
    { title: t("approvedKYC.tabel.name") },
    { title: t("approvedKYC.tabel.email") },
    { title: t("approvedKYC.tabel.submitted") },
    { title: t("approvedKYC.tabel.status") },
    { title: t("approvedKYC.tabel.action") },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await dispatch(getAllKycAdmin());
    if (res?.status === 200) {
      // Filter submitted, resubmit, and rejected status (rejected should still show)
      const filteredData = (res.data || []).filter(
        (item) => 
          item.status === "submitted" || 
          item.status === "resubmit" || 
          item.status === "rejected"
      );
      setKycData(filteredData);
    }
    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return kycData.filter((item) => {
      const name = item.user?.name?.toLowerCase() || "";
      const email = item.user?.email?.toLowerCase() || "";
      return name.includes(term) || email.includes(term);
    });
  }, [kycData, search]);

  const statusBadge = (status) => {
    const map = {
      draft: "secondary",
      submitted: "info",
      resubmit: "warning",
      approved: "success",
      rejected: "danger",
    };
    return (
      <Badge
        bg={map[status] || "secondary"}
        className=""
        style={{ marginBottom: "0px", fontSize: "0.85rem" }}
      >
        {status?.toUpperCase()}
      </Badge>
    );
  };

  const rowData = filtered.map((item) => ({
    data: [
      { value: item.user?.name || "-" },
      { value: item.user?.email || "-" },
      {
        value: item.submittedAt
          ? new Date(item.submittedAt).toLocaleDateString()
          : "-",
      },
      { value: statusBadge(item.status) },
      {
        value: (
          <button
            onClick={() => navigate(`/approve-kyc/${item._id}`, { state: { from: "kyc-approval" } })}
            className="px-4 py-1 fs-6"
            style={{
              border: "none",
              backgroundColor: "#6fadfaff",
              color: "white",
              borderRadius: "15px",
            }}
          >
            View
          </button>
        ),
      },
    ],
  }));

  return (
    <div id="my-services-container" className="mt-3">
      <div className="services-header-block">
        <div className="content-block">
          <div className="title-value-block d-flex align-items-center gap-2 mb-3">
            <div className="text-20-700 color-black-100">
              {t("kycApproval.header")}
            </div>
          </div>

          <div className="d-flex align-items-center">
            <SearchInput
              placeholder={t("approvedKYC.placeHolder")}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-auto mt-3">
          <Table
            header={header}
            rowData={rowData}
            isLoading={loading}
            tableData={{
              total: rowData.length,
              offset: 0,
              limit: 10,
              intervalLimit: 10,
            }}
            changeOffset={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default KYCApproval;

