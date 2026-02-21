import React from "react";
import BootrsapTable from "react-bootstrap/Table";
import { Dropdown } from "react-bootstrap";
import Loader from "../Loader";
import "./Table.scss";
import { useTranslation } from "react-i18next";

const Table = ({
  header,
  rowData,
  changeOffset,
  isLoading,
  tableData,
  tHead,
  clickedCellIndex,
  onCellClick,
  isClick,
}) => {

  const { t, i18n } = useTranslation();
  
  const { total, offset, limit, intervalLimit } = tableData || {};
  const totalPage = Math.ceil(total / limit);
  const totalPage2 = Math.ceil(total / intervalLimit);
  const activePage = offset / limit + 1;

  const maxPages = 3;
  let paginate = [];

  if (total <= intervalLimit) {
    paginate = [total];
  } else {
    const pageCount = Math.ceil(total / intervalLimit);
    for (let i = 1; i <= Math.min(pageCount, maxPages); i++) {
      paginate.push(Math.min(i * intervalLimit, total));
    }
  }

  const start = offset;
  const end = offset + limit;
  const paginatedRows = rowData?.slice(start, end);

  return (
    <div id="table-container" className="iferp-scroll">
      <BootrsapTable>
        <thead className="table-header-container">
          <tr className="header-container">
            {header.map((elem, index) => {
              return (
                <th key={index} className={tHead ? tHead : "column-block pe-4"}>
                  {elem.title}
                </th>
              );
            })}
          </tr>
        </thead>
       
        <tbody className="table-body-container">
          {isLoading && (
            <tr className="loader-row">
              <td colSpan={header.length} className="loader-cell text-center color-gray">
                <Loader />
              </td>
            </tr>
          )}
          {!isLoading && (
            <>
              {paginatedRows.length === 0 ? (
                <tr className="no-record-found-row">
                  <td colSpan={header.length} className="no-record-found-cell text-center color-gray">
                    {t("table.pagination.noResult")}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((elem, index) => (
                  <tr key={index} className="row-container">
                    {elem?.data?.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        onClick={() =>
                          isClick && onCellClick(index * elem.data.length + cellIndex)
                        }
                        className={
                          clickedCellIndex === index * elem.data.length + cellIndex
                            ? "row-block pe-4 open"
                            : "row-block pe-4"
                        }
                      >
                        {cell.value}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </>
          )}
        </tbody>
      </BootrsapTable>
      {rowData.length > 0 && !isLoading && (
        <div className="table-paginate">
          <div className="cms-24 pt-2 pb-1 d-flex align-items-center">
            <span className="text-13-500 color-dashboard-primary">
                {t("table.pagination.results")}
            </span>
            <span className="page-drop ms-2 h-auto">
              <Dropdown align="bottom" drop="up">
                <Dropdown.Toggle variant="" id="dropdown-basic">
                  <span className="text-13-500">{limit}</span>
                  <span className="text-13-500">
                    <i className="bi bi-caret-down-fill pointer ms-2" />
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  style={{
                    minWidth: "80px",
                  }}
                >
                  {paginate?.map((el, index) => {
                    return (
                      <Dropdown.Item
                        href=""
                        className="d-flex align-items-center gap-2 mb-1"
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          changeOffset(0, el);
                        }}
                      >
                        <span className="mt-1 text-13-500">{el}</span>
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </span>
          </div>
          <div className="d-flex align-items-center gap-3 cme-30">
            <span
              className={activePage === 1 ? "inactive-link" : "active-link"}
              onClick={() => {
                if (activePage !== 1) {
                  changeOffset(tableData?.offset - tableData?.limit);
                }
              }}
            >
              {t("table.pagination.prev")}
            </span>

            <span className="page-no">{activePage}</span>
            <span
              className={
                activePage === totalPage ? "inactive-link" : "active-link"
              }
              onClick={() => {
                if (activePage !== totalPage) {
                  changeOffset(tableData?.offset + tableData?.limit);
                }
              }}
            >
              {t("table.pagination.next")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default Table;
