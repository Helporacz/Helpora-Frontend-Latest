import { useCallback, useEffect, useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";

import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput";
import DeleteConfirmPopup from "components/layouts/DeleteConfirmPopup/DeleteConfirmPopup";
import Table from "components/layouts/Table/Table";

import { useTranslation } from "react-i18next";
import {
  deleteServices,
  getAllServices,
  throwSuccess,
} from "store/globalSlice";
import { icons } from "utils/constants";
import { titleCaseString } from "utils/helpers";
import AddServiceModelForm from "./AddServiceModelForm";

const ViewServices = () => {
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
      const response = await dispatch(getAllServices());
      const allData = response?.serviceData?.map((o) => ({ ...o })) || [];

      const filteredData = allData.filter((provider) => {
        const search = tableData.search.trimEnd().toLowerCase();
        const titleByLang =
          currentLang === "cz" ? provider.cz_title : provider.title;
        return titleByLang?.toLowerCase().includes(search);
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
  }, [dispatch, tableData.search, currentLang]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const header = [
    { title: t("services.table.header1") },
    { title: t("services.table.header2") },
    { title: t("services.table.header3") },
    { title: t("services.table.header4") },
    { title: t("services.table.header5") },
    { title: t("services.table.header6") },
  ];

  const statusColors = {
    active: "success",
    deactive: "danger",
  };

  const rowData =
    tableData?.data?.map((elem) => {
      const { _id, title, category, status, cz_title, image, position } = elem;

      const displayTitle = currentLang === "cz" ? cz_title || title : title;

      return {
        data: [
          {
            value: (
              <div className="text-start d-flex align-items-center gap-3 pointer">
                  <div className="text-13-500-21 color-black-100">
                    {titleCaseString(displayTitle || "Service Name")}
                  </div>
              </div>
            ),
          },
          { value: category?.map((item)=>item.label) || "-" },
          {
            value: image ? (
              <img
                src={image}
                alt={title || "Category Image"}
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
          {
            value: (
              <Badge
                bg={statusColors[status] || "secondary"}
                className="px-3 py-2"
                style={{ fontSize: "14px", cursor: "pointer", color:"white" }}
              >
                {status ? t(`common.${status}`) : "-"}
              </Badge>
            ),
          },
          {
            value: position || "_"
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
                      Edit Service
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
                      Delete Service
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
    fetchTableData();
  };
  return (
    <div id="providers-container" className="mt-3">
      {isDeletePopup && deleteId && (
        <DeleteConfirmPopup
          title="Service"
          deleteId={deleteId}
          onHide={() => setIsDeletePopup(false)}
          apiFunction={async () => {
            await dispatch(deleteServices(deleteId._id));
            dispatch(throwSuccess(t("messages.serviceDeletedSuccessfully")));
            setIsDeletePopup(false);
            fetchTableData();
          }}
          handelSuccess={() => fetchTableData()}
        />
      )}

      {showAddModal && (
        <AddServiceModelForm
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setUpdateProviderData(null);
          }}
          onSuccess={handleModalSuccess}
          isUpdate={!!updateProviderData}
          initialValues={updateProviderData || null}
          serviceId={updateProviderData?._id}
          handelSuccess={() => fetchTableData()}
        />
      )}

      <div className="providers-header-block">
        <div className="content-block cps-10 cpt-24 cpe-24">
          <div className="title-value-block d-flex align-items-center gap-2 cmb-24">
            <div className="text-20-700 color-black-100">{t("services.heading")}</div>
            <div className="value-block text-13-600 color-dashboard-primary cpt-2 cpe-6 cpb-2 cps-6">
              {tableData?.total}
            </div>
          </div>

          <div className="header-buttons-block d-flex justify-content-between gap-2 flex-wrap cmb-20">
            <SearchInput
              placeholder={t("services.searchbarPlaceholder")}
              value={tableData.search}
              onChange={(e) =>
                setTableData((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Button
              btnText={t("services.addButton")}
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

export default ViewServices;
