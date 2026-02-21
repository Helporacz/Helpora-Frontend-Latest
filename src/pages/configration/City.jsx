import { useCallback, useEffect, useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput";
import DeleteConfirmPopup from "components/layouts/DeleteConfirmPopup/DeleteConfirmPopup";
import Table from "components/layouts/Table/Table";
import {
  deleteCity,
  getAllCities,
  throwSuccess,
} from "store/globalSlice";
import { icons } from "utils/constants";
import { titleCaseString } from "utils/helpers";
import { useTranslation } from "react-i18next";
import AddCity from "./Form/AddCity";

const Cities = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";

  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updateCityData, setUpdateCityData] = useState(null);
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
      const response = await dispatch(getAllCities());
      const allData = response?.cities?.map((o) => ({ ...o })) || [];

      const filteredData = allData.filter((city) => {
        const search = tableData.search.trimEnd().toLowerCase();
        return (
          city.nameEn?.toLowerCase().includes(search) 
        );
      });

      setTableData((prev) => ({
        ...prev,
        data: filteredData,
        total: filteredData.length,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      setTableData((prev) => ({ ...prev, loading: false }));
    }
  }, [dispatch, tableData.search]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const header = [
    { title: t("city.table.name") },
    { title: t("city.table.regionName") },
    { title: t("city.table.action") },
  ];

  const rowData =
    tableData?.data?.map((elem) => {
      const {
        _id,
        nameEn,
        nameCs,
        region,
      } = elem;
      console.log(elem,'======');
      
      const displayName = currentLang === "cz" ? nameCs : nameEn;
      const displayRegion = currentLang === "cz" ? region?.nameCs : region?.nameEn;

      return {
        data: [
          {
            value: (
              <div className="text-start d-flex align-items-center gap-3 pointer">
                <div>
                  <div className="text-13-500-21 color-black-100">
                    {titleCaseString(displayName || "City Name")}
                  </div>
                </div>
              </div>
            ),
          },
          { value: displayRegion || "-" },
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
                      setUpdateCityData(elem);
                    }}
                  >
                    <img src={icons.edit} alt="edit" />
                    <span className="mt-1 color-dashboard-primary">
                      {t("city.table.editCity")}
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
                      {t("city.table.deleteCity")}
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
    <div id="city-container" className="mt-3">
      {isDeletePopup && deleteId && (
        <DeleteConfirmPopup
          title="City"
          deleteId={deleteId}
          onHide={() => setIsDeletePopup(false)}
          apiFunction={async () => {
            await dispatch(deleteCity(deleteId._id));
            dispatch(throwSuccess(t("messages.deleteCity")));
            setIsDeletePopup(false);
            fetchTableData();
          }}
          handelSuccess={() => fetchTableData()}
        />
      )}

      <div className="cities-header-block">
        <div className="content-block cps-10 cpt-24 cpe-24">
          <div className="title-value-block d-flex align-items-center gap-2 cmb-24">
            <div className="text-20-700 color-black-100">
              {t("city.heading")}
            </div>
            <div className="value-block text-13-600 color-dashboard-primary cpt-2 cpe-6 cpb-2 cps-6">
              {tableData?.total}
            </div>
          </div>

          <div className="header-buttons-block d-flex justify-content-between gap-2 flex-wrap cmb-20">
            <SearchInput
              placeholder={t("city.searchbarPlaceholder")}
              value={tableData.search}
              onChange={(e) =>
                setTableData((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Button
              btnText={t("city.addButton")}
              btnStyle="PLO"
              leftIcon={<img src={icons.addSquareBlack} alt="add-city" />}
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
        <AddCity
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setUpdateCityData(null);
          }}
          onSuccess={handleModalSuccess}
          isUpdate={!!updateCityData}
          initialValues={updateCityData || null}
          userId={updateCityData?._id}
          handelSuccess={() => fetchTableData()}
        />
      )}
    </div>
  );
};

export default Cities;
