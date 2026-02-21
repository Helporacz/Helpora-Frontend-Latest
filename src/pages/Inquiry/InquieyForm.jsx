import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Dropdown, Modal } from "react-bootstrap";
import { getAllForm, getFormById } from "store/globalSlice";
import { titleCaseString } from "utils/helpers";
import Table from "components/layouts/Table/Table";
import { icons } from "utils/constants";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ViewInquiryModel from "./ViewInquiryModel";

const ViewInquirys = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const handleViewInquiry = async (inquiryId) => {
    try {
      setShowModal(true);
      const response = await dispatch(getFormById(inquiryId));
      const inquiryDetails = response?.contact || null;
      setSelectedInquiry(inquiryDetails);
    } catch (error) {
      console.error("Error fetching inquiry details:", error);
    }
  };

  const [tableData, setTableData] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    search: "",
    loading: true,
    data: [],
  });

  // Fetch data with search filter
  const fetchTableData = useCallback(async () => {
    try {
      const response = await dispatch(getAllForm());
      const allData = response?.contacts || [];

      const filteredData = allData.filter((contact) => {
        const searchTerm = tableData.search.trim().toLowerCase();
        return (
          contact.name?.toLowerCase().includes(searchTerm) ||
          contact.email?.toLowerCase().includes(searchTerm)
        );
      });

      setTableData((prev) => ({
        ...prev,
        data: filteredData,
        total: filteredData.length,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // Format Date and Time
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

  // Table Headers
  const header = [
    { title: t("inquiry.table.header1") },
    { title: t("inquiry.table.header2") },
    { title: t("inquiry.table.header3") },
    { title: t("inquiry.table.header6") },
    { title: t("inquiry.table.header5") },
  ];

  // Prepare Row Data
  const rowData =
    tableData?.data?.map((client) => {
      const { _id, name, email, subject, createdAt } = client;

      return {
        data: [
          {
            value: (
              <div className="d-flex align-items-center gap-3">
                <div className="pointer">
                  <div className="text-13-500-21 color-black-100">
                    {titleCaseString(name || "Client Name")}
                  </div>
                </div>
              </div>
            ),
          },
          { value: email || "-" },
          { value: subject || "-" },
          { value: formatDateTime(createdAt) || "-" },
          {
            value: (
              <Dropdown align="end">
                <Dropdown.Toggle variant="" id={`dropdown-${_id}`}>
                  <img
                    src={icons.threeDots}
                    alt="options"
                    className="pointer"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    className="d-flex align-items-center gap-2"
                    onClick={() => handleViewInquiry(client._id)}
                  >
                    <MdOutlineRemoveRedEye />
                    <span className="mt-1 color-dashboard-primary">View</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ),
          },
        ],
      };
    }) || [];

  // Handle table pagination
  const handlePaginationChange = (newOffset, newLimit = tableData.limit) => {
    const updated = {
      ...tableData,
      offset: newOffset,
      limit: newLimit,
      loading: true,
    };
    setTableData(updated);
    fetchTableData();
  };

  return (
    <div id="providers-container" className="mt-3">
      <div className="providers-header-block">
        <div className="content-block cps-10 cpt-24 cpe-24">
          <div className="title-value-block d-flex align-items-center gap-2 cmb-24">
            <div className="text-20-700 color-black-100">
              {t("inquiry.heading")}
            </div>
            <div className="value-block text-13-600 color-dashboard-primary cpt-2 cpe-6 cpb-2 cps-6">
              {tableData?.total}
            </div>
          </div>
        </div>

        <div className="overflow-auto">
          <Table
            header={header}
            rowData={rowData}
            isLoading={tableData.loading}
            tableData={tableData}
            changeOffset={handlePaginationChange}
          />
        </div>
      </div>

      {showModal && (
        <ViewInquiryModel
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
          selectedInquiry={selectedInquiry}
        />
      )}
    </div>
  );
};

export default ViewInquirys;
