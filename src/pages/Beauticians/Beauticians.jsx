import { useCallback, useEffect, useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput";
import DeleteConfirmPopup from "components/layouts/DeleteConfirmPopup/DeleteConfirmPopup";
import Table from "components/layouts/Table/Table";
import UserProfileLayout from "components/layouts/UserProfileLayout";
import AddProviderModal from "pages/Provider/AddProvider";
import {
  deleteProvider,
  getAllProvider,
  throwSuccess,
  toggleProviderStatus,
} from "store/globalSlice";
import { icons } from "utils/constants";
import { titleCaseString } from "utils/helpers";
import "./Beauticians.scss";
import { useTranslation } from "react-i18next";

const Beauticians = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";

  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updateProviderData, setUpdateProviderData] = useState(null);
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

  const fetchTableData = useCallback(async () => {
    try {
      const response = await dispatch(getAllProvider());
      const allData = response?.allProvider?.map((o) => ({ ...o })) || [];

      const filteredData = allData.filter((provider) => {
        const search = tableData.search.trimEnd().toLowerCase();
        return (
          provider.name?.toLowerCase().includes(search) ||
          provider.email?.toLowerCase().includes(search)
        );
      });

      setTableData((prev) => ({
        ...prev,
        data: filteredData,
        total: filteredData.length,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching providers:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

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

  const header = [
    { title: t("providers.table.header1") },
    { title: t("providers.table.header2") },
    { title: t("providers.table.header3") },
    { title: t("providers.table.header4") },
    { title: t("providers.table.header6") },
    { title: t("providers.table.header7") },
    { title: t("providers.table.header10") },
    { title: t("providers.table.header11") },
    { title: t("providers.table.header12") },
    { title: t("providers.table.header8") },
    { title: t("providers.table.header9") },
    { title: t("providers.table.header5") },
  ];

  const truncate = (text, max = 50) => {
    if (!text) return "-";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const rowData =
    tableData?.data?.map((elem) => {
      const {
        _id,
        name,
        email,
        address,
        phoneNumber,
        profileImage,
        completedOrders,
        totalEarnAmount,
        region,
        city,
        district,
        lastLogin,
        isActiveProvider,
      } = elem;
      const displayRegion =
        currentLang === "cz" ? region?.nameCs : region?.nameEn;
      const displayCity = currentLang === "cz" ? city?.nameCs : city?.nameEn;
      const displayDistrict =
        currentLang === "cz" ? district?.nameCs : district?.nameEn;

      return {
        data: [
          {
            value: (
              <div className="text-start d-flex align-items-center gap-3 pointer">
                <UserProfileLayout isSquare url={profileImage} size="40" />
                <div>
                  <div className="text-13-500-21 color-black-100">
                    {titleCaseString(name || "Provider Name")}
                  </div>
                </div>
              </div>
            ),
          },
          { value: email || "-" },
          { value: truncate(address, 50) },
          {
            value: phoneNumber || "_",
          },
          {
            value: completedOrders || "0",
          },
          {
            value: `CZK${totalEarnAmount}` || "0",
          },
          { value: displayRegion || "-" },
          { value: displayCity || "-" },
          { value: displayDistrict || "-" },
          {
            value: formatDateTime(lastLogin) || "0",
          },
          {
            value: (
              <Badge
                bg={isActiveProvider === true ? "success" : "danger"}
                className="pointer"
                onClick={async () => {
                  try {
                    const res = await dispatch(toggleProviderStatus(_id));
                    if (res?.status === 200) {
                      dispatch(
                        throwSuccess(
                          `Provider ${
                            isActiveProvider ? "suspended" : "activated"
                          } successfully`
                        )
                      );
                      // Use the response data to update
                      setTableData((prev) => ({
                        ...prev,
                        data: prev.data.map((provider) =>
                          provider._id === _id
                            ? {
                                ...provider,
                                isActiveProvider: res.data.isActiveProvider,
                              }
                            : provider
                        ),
                      }));
                    }
                  } catch (error) {
                    console.error("Error toggling provider status:", error);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {isActiveProvider === true
                  ? t("providers.table.active")
                  : t("providers.table.suspend")}
              </Badge>
            ),
          },
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
                    className="d-flex align-items-center gap-2 mb-1"
                    onClick={() => {
                      setShowAddModal(true);
                      setUpdateProviderData(elem);
                    }}
                  >
                    <img src={icons.edit} alt="edit" />
                    <span className="mt-1 color-dashboard-primary">
                      {t("providers.table.editProvider")}
                    </span>
                  </Dropdown.Item>

                  <Dropdown.Item
                    className="d-flex align-items-center gap-2 mb-1"
                    onClick={() => {
                      setIsDeletePopup(true);
                      setDeleteId(elem);
                    }}
                  >
                    <img src={icons.trashIcon} alt="delete" />
                    <span className="mt-1 color-dashboard-primary">
                      {t("providers.table.deleteProvider")}
                    </span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ),
          },
        ],
      };
    }) || [];

  const handleModalSuccess = () => {
    setTableData((prev) => ({ ...prev, offset: 0, loading: true }));
    fetchTableData();
  };
  return (
    <div id="providers-container" className="mt-3">
      {isDeletePopup && deleteId && (
        <DeleteConfirmPopup
          title="Provider"
          deleteId={deleteId}
          onHide={() => setIsDeletePopup(false)}
          apiFunction={async () => {
            await dispatch(deleteProvider(deleteId._id));
            dispatch(throwSuccess(t("messages.providerDeletedSuccessfully")));
            setIsDeletePopup(false);
            fetchTableData();
          }}
          handelSuccess={() => fetchTableData()}
        />
      )}

      {showAddModal && (
        <AddProviderModal
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setUpdateProviderData(null);
          }}
          onSuccess={handleModalSuccess}
          isUpdate={!!updateProviderData}
          initialValues={updateProviderData || null}
          userId={updateProviderData?._id}
        />
      )}

      <div className="providers-header-block">
        <div className="content-block cps-10 cpt-24 cpe-24">
          <div className="title-value-block d-flex align-items-center gap-2 cmb-24">
            <div className="text-20-700 color-black-100">
              {t("providers.heading")}
            </div>
            <div className="value-block text-13-600 color-dashboard-primary cpt-2 cpe-6 cpb-2 cps-6">
              {tableData?.total}
            </div>
          </div>

          <div className="header-buttons-block d-flex justify-content-between gap-2 flex-wrap cmb-20">
            <SearchInput
              placeholder={t("providers.searchbarPlaceholder")}
              value={tableData.search}
              onChange={(e) =>
                setTableData((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Button
              btnText={t("providers.addButton")}
              btnStyle="PLO"
              leftIcon={<img src={icons.addSquareBlack} alt="add-provider" />}
              onClick={() => setShowAddModal(true)}
            />
          </div>
        </div>

        <div className="overflow-auto">
          <Table
            header={header}
            rowData={rowData}
            isLoading={tableData?.loading}
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

export default Beauticians;
