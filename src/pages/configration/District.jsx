import { useCallback, useEffect, useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput";
import DeleteConfirmPopup from "components/layouts/DeleteConfirmPopup/DeleteConfirmPopup";
import Table from "components/layouts/Table/Table";
import {
  deleteDistrict,
  getAllDistricts,
  throwSuccess,
} from "store/globalSlice";
import { icons } from "utils/constants";
import { titleCaseString } from "utils/helpers";
import { useTranslation } from "react-i18next";
import AddDistict from "./Form/AddDistrict";

const Districts = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";

  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updateDistrictData, setUpdateDistrictData] = useState(null);
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
      const response = await dispatch(getAllDistricts());
      const allData = response?.districts?.map((o) => ({ ...o })) || [];

      const filteredData = allData.filter((district) => {
        const search = tableData.search.trimEnd().toLowerCase();
        return (
          district.nameEn?.toLowerCase().includes(search)
        );
      });

      setTableData((prev) => ({
        ...prev,
        data: filteredData,
        total: filteredData.length,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching districts:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const header = [
    { title: t("district.table.name") },
    { title: t("district.table.cityName") },
    { title: t("district.table.action") },
  ];

  const rowData =
    tableData?.data?.map((elem) => {
      const {
        _id,
        nameEn,
        nameCs,
        city
      } = elem;

      const displayName = currentLang === "cz" ? nameCs : nameEn;
      const displayCity = currentLang === "cz" ? city?.nameCs : city?.nameEn;

      return {
        data: [
          {
            value: (
              <div className="text-start d-flex align-items-center gap-3 pointer">
                <div>
                  <div className="text-13-500-21 color-black-100">
                    {titleCaseString(displayName || "District Name")}
                  </div>
                </div>
              </div>
            ),
          },
          { value: displayCity || "-" },
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
                      setUpdateDistrictData(elem);
                    }}
                  >
                    <img src={icons.edit} alt="edit" />
                    <span className="mt-1 color-dashboard-primary">
                      {t("district.table.editDistrict")}
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
                      {t("district.table.deleteDistrict")}
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
    <div id="districts-container" className="mt-3">
      {isDeletePopup && deleteId && (
        <DeleteConfirmPopup
          title="District"
          deleteId={deleteId}
          onHide={() => setIsDeletePopup(false)}
          apiFunction={async () => {
            await dispatch(deleteDistrict(deleteId._id));
            dispatch(throwSuccess(t("messages.deleteDistrict")));
            setIsDeletePopup(false);
            fetchTableData();
          }}
          handelSuccess={() => fetchTableData()}
        />
      )}

      <div className="district-header-block">
        <div className="content-block cps-10 cpt-24 cpe-24">
          <div className="title-value-block d-flex align-items-center gap-2 cmb-24">
            <div className="text-20-700 color-black-100">
              {t("district.heading")}
            </div>
            <div className="value-block text-13-600 color-dashboard-primary cpt-2 cpe-6 cpb-2 cps-6">
              {tableData?.total}
            </div>
          </div>

          <div className="header-buttons-block d-flex justify-content-between gap-2 flex-wrap cmb-20">
            <SearchInput
              placeholder={t("district.searchbarPlaceholder")}
              value={tableData.search}
              onChange={(e) =>
                setTableData((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Button
              btnText={t("district.addButton")}
              btnStyle="PLO"
              leftIcon={<img src={icons.addSquareBlack} alt="add-district" />}
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

      {showAddModal && (
        <AddDistict
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setUpdateDistrictData(null);
          }}
          onSuccess={handleModalSuccess}
          isUpdate={!!updateDistrictData}
          initialValues={updateDistrictData || null}
          userId={updateDistrictData?._id}
          handelSuccess={() => fetchTableData()}
        />
      )}
    </div>
  );
};

export default Districts;
