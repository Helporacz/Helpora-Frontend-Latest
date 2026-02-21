import { useCallback, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput";
import DeleteConfirmPopup from "components/layouts/DeleteConfirmPopup/DeleteConfirmPopup";
import Table from "components/layouts/Table/Table";
import AddProviderServiceModal from "./AddProviderServiceModal";

import {
  deleteProviderServices,
  fetchProviderServices,
  getAllServices,
  throwSuccess,
} from "store/globalSlice";

import { icons } from "utils/constants";
import { useTranslation } from "react-i18next";

const MyServices = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";
  const [allServices, setAllServices] = useState([]);
  const [tableData, setTableData] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    search: "",
    loading: true,
    data: [],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [updateServiceData, setUpdateServiceData] = useState(null);
  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchTableData = useCallback(async () => {
    try {
      const res = await dispatch(fetchProviderServices());
      let data = res?.providerServices || [];

      if (tableData.search) {
        const search = tableData.search.trimEnd().toLowerCase();
        data = data.filter(
          (item) => {
            const title =
              currentLang === "cz"
                ? item.service?.cz_title || item.service?.title
                : item.service?.title || item.service?.cz_title;
            return title?.toLowerCase().includes(search);
          }
        );
      }
      setTableData((prev) => ({
        ...prev,
        data,
        total: data.length,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching provider services:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search, currentLang]);

  const fetchAllServiceOptions = useCallback(async () => {
    try {
      const res = await dispatch(getAllServices());
      setAllServices(res || []);
    } catch (error) {
      console.error("Error fetching all services:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllServiceOptions();
    fetchTableData();
  }, [fetchAllServiceOptions, fetchTableData]);

  const handleModalSuccess = () => {
    fetchTableData();
    setShowAddModal(false);
    setUpdateServiceData(null);
  };

  const header = [
    { title: t("myService.table.header1") },
    { title: t("myService.table.header2") },
    { title: t("myService.table.header3") },
    { title: t("myService.table.header4") },
    { title: t("myService.table.header5") },
    { title: t("myService.table.header6") },
    { title: t("myService.table.header7") },
  ];

  const rowData =
    tableData.data?.map((item) => {
      const { _id, service } = item;

      const displayTitle = currentLang === "cz" ? service.cz_title || service?.title : service?.title;

      return {
        data: [
          { value: displayTitle || "-" },
          { value: service?.category?.map((item) => item.name) || "-" },
          {
            value:
              item?.priceType === "range" && (item?.priceFrom || item?.priceTo)
                ? `CZK${item?.priceFrom || "-"} - CZK${item?.priceTo || "-"}`
                : item?.price
                ? `CZK${item.price}`
                : "-",
          },
          {
            value: t(
              item?.priceType === "hourly"
                ? "providerServiceForm.priceType.hourly"
                : item?.priceType === "range"
                ? "providerServiceForm.priceType.range"
                : "providerServiceForm.priceType.fixed"
            ),
          },
          {
            value: (item?.image || service?.image) ? (
              <img
                src={item?.image || service?.image}
                alt={(item?.image || service?.image) || "Category Image"}
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ) : (
              "-"
            ),
          },
          { value: item?.status || "-" },
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
                      setUpdateServiceData(item);
                    }}
                  >
                    <img src={icons.edit} alt="edit" />
                    <span className="mt-1 color-dashboard-primary">Edit</span>
                  </Dropdown.Item>

                  <Dropdown.Item
                    className="d-flex align-items-center gap-2 mb-1"
                    onClick={() => {
                      setIsDeletePopup(true);
                      setDeleteItem(item);
                    }}
                  >
                    <img src={icons.trashIcon} alt="delete" />
                    <span className="mt-1 color-dashboard-primary">Delete</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ),
          },
        ],
      };
    }) || [];

  return (
    <div id="my-services-container" className="mt-3">
      {isDeletePopup && deleteItem && (
        <DeleteConfirmPopup
          title="Provider Service"
          deleteId={deleteItem}
          onHide={() => setIsDeletePopup(false)}
          apiFunction={async () => {
            await dispatch(deleteProviderServices(deleteItem._id));
            dispatch(throwSuccess(t("messages.serviceDeletedSuccessfully")));
            setIsDeletePopup(false);
            fetchTableData();
          }}
          handelSuccess={fetchTableData}
        />
      )}

      {showAddModal && (
        <AddProviderServiceModal
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setUpdateServiceData(null);
          }}
          onSuccess={handleModalSuccess}
          initialValues={updateServiceData || null}
          allServices={allServices}
          serviceId={updateServiceData?._id}
          isUpdate={!!updateServiceData}
        />
      )}

      <div className="services-header-block">
        <div className="content-block">
          <div className="title-value-block d-flex align-items-center gap-2 mb-3">
            <div className="text-20-700 color-black-100">
              {t("myService.heading")}
            </div>
            <div className="value-block text-13-600 color-dashboard-primary">
              {tableData.total}
            </div>
          </div>

          <div className="header-buttons-block d-flex justify-content-between gap-2 flex-wrap mb-3">
            <SearchInput
              placeholder={t("myService.searchbarPlaceholder")}
              value={tableData.search}
              onChange={(e) =>
                setTableData((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Button
              btnText={t("myService.addButton")}
              btnStyle="PLO"
              leftIcon={<img src={icons.addSquareBlack} alt="add-service" />}
              onClick={() => setShowAddModal(true)}
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
                loading: true,
              }));
              fetchTableData();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MyServices;
