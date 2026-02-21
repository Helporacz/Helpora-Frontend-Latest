import { useState } from "react";
import SearchInput from "components/form/SearchInput";
import Button from "components/form/Button";
import CardView from "./CardView";
import TableView from "./TableView";
import "./AdminList.scss";

const AdminList = () => {
  const [type, setType] = useState(0);
  const [data, setData] = useState([
    {
      name: "Rachel Vince",
      id: "ID: SLKA0000001",
      role: "Sub-admin",
      isActive: false,
    },
    {
      name: "Rachel Vince",
      id: "ID: SLKA0000002",
      role: "Sub-admin",
      isActive: true,
    },
    {
      name: "Rachel Vince",
      id: "ID: SLKA0000003",
      role: "Sub-admin",
      isActive: true,
    },
  ]);
  const handelStatus = () => {
    setData((prev) => {
      let oldVal = prev;
      oldVal.map((el) => {
        let newObj = el;
        if (newObj?.id === el?.id) {
          newObj.status = el?.status === 1 ? 0 : 1;
        }
        return newObj;
      });
      return oldVal;
    });
  };

  return (
    <div id="admin-list-container" className="cps-24 cpt-48 cme-24 h-100 pb-5">
      <div className="d-flex justify-content-between align-items-center cmb-24">
        <div className="text-20-700 color-dashboard-primary">Admins</div>
      </div>
      <div className="cmb-40 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <Button btnText="All" btnStyle="PLO" iconType="R-Filter" />

          <SearchInput
            placeholder="Search admin"
            value=""
            onChange={() => {}}
          />

          <Button btnText="ARCHIVE" btnStyle="PLO" iconType="L-Archive" />
        </div>
        <div>
          <i
            className={`bi ${
              type === 0 ? "bi-list-ul" : "bi-grid"
            } text-20-700 pointer`}
            onClick={() => {
              setType(type === 0 ? 1 : 0);
            }}
          />
        </div>
      </div>
      {type === 0 ? (
        <CardView data={data} handelStatus={handelStatus} />
      ) : (
        <TableView data={data} handelStatus={handelStatus} />
      )}
    </div>
  );
};
export default AdminList;
