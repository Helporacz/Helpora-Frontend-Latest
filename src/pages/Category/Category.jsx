import { useCallback, useEffect, useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";

import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput";
import DeleteConfirmPopup from "components/layouts/DeleteConfirmPopup/DeleteConfirmPopup";
import Table from "components/layouts/Table/Table";

import {
  deleteCategory,
  getAllCategory,
  throwSuccess,
} from "store/globalSlice";

import { useTranslation } from "react-i18next";
import { icons } from "utils/constants";
import { titleCaseString } from "utils/helpers";
import AddCategoryFormModel from "./AddCategoryFormModel";

const Category = () => {
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
      const response = await dispatch(getAllCategory());
      const categoryData = response?.data?.map((o) => ({ ...o })) || [];

      const filteredData = categoryData.filter((category) => {
        const search = tableData.search.trimEnd().toLowerCase();
        const nameByLang =
          currentLang === "cz" ? category.cz_name : category.name;
        return nameByLang?.toLowerCase().includes(search);
      });

      setTableData((prev) => ({
        ...prev,
        categoryData: filteredData,
        total: filteredData.length,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search, currentLang]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const header = [
    { title: t("category.table.header1") },
    { title: t("category.table.header2") },
    { title: t("category.table.header3") },
    { title: t("category.table.header4") },
    { title: t("category.table.header5") },
  ];

  const statusColors = {
    active: "success",
    deactive: "danger",
  };

  const rowData =
    tableData?.categoryData?.map((elem) => {
      const { _id, position, name, cz_name, image, status } = elem;

      const displayName = currentLang === "cz" ? cz_name || name : name;
      return {
        data: [
          {
            value: (
              <div className="text-start d-flex align-items-center gap-3 pointer">
                <div className="text-13-500-21 color-black-100">
                  {titleCaseString(displayName || "Provider Name")}
                </div>
              </div>
            ),
          },
          {
            value:
              <img
                src={image}
                alt={name || "Category Image"}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 4,
                }}
              />
          },
          {
            value: (
              <Badge
                bg={statusColors[status] || "secondary"}
                className="px-3 py-2"
                style={{ fontSize: "14px", cursor: "pointer", color: "white" }}
              >
                {status ? t(`common.${status}`) : "-"}
              </Badge>
            ),
          },
          { value: position || "-" },
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
                      Edit Category
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
                      Delete Category
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
          title="Category"
          deleteId={deleteId}
          onHide={() => setIsDeletePopup(false)}
          apiFunction={async () => {
            await dispatch(deleteCategory(deleteId._id));
            dispatch(throwSuccess(t("messages.categoryDeletedSuccessfully")));
            setIsDeletePopup(false);
            fetchTableData();
          }}
          handelSuccess={() => fetchTableData()}
        />
      )}

      {showAddModal && (
        <AddCategoryFormModel
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setUpdateProviderData(null);
          }}
          onSuccess={handleModalSuccess}
          isUpdate={!!updateProviderData}
          initialValues={updateProviderData || null}
          userId={updateProviderData?._id}
          handelSuccess={() => fetchTableData()}
        />
      )}

      <div className="providers-header-block">
        <div className="content-block cps-10 cpt-24 cpe-24">
          <div className="title-value-block d-flex align-items-center gap-2 cmb-24">
            <div className="text-20-700 color-black-100">
              {t("category.heading")}
            </div>
            <div className="value-block text-13-600 color-dashboard-primary cpt-2 cpe-6 cpb-2 cps-6">
              {tableData?.total}
            </div>
          </div>

          <div className="header-buttons-block d-flex justify-content-between align-items-center gap-3 flex-wrap cmb-20">
            <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
              <SearchInput
                placeholder={t("category.searchbarPlaceholder")}
                value={tableData.search}
                onChange={(e) =>
                  setTableData((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <Button
              btnText={t("category.addButton")}
              btnStyle="PLO"
              leftIcon={<img src={icons.addSquareBlack} alt="add-provider" />}
              onClick={() => setShowAddModal(true)}
              className=""
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

export default Category;
