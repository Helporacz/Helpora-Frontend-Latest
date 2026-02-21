import React, { useEffect, useState } from "react";
import Table from "components/layouts/Table/Table";
import { Dropdown } from "react-bootstrap";
import { icons } from "utils/constants";
import { omit } from "lodash";
import {
  adminStatusUpdate,
  getAdmins,
  throwSuccess,
  unArchiveAdmins,
  // deleteBeautician,
} from "store/globalSlice";
import { useDispatch, useSelector } from "react-redux";
import StatusContainer from "components/layouts/StatusContainer/StatusContainer";
import { objectToQueryParams, titleCaseString } from "utils/helpers";
import UserProfileLayout from "components/layouts/UserProfileLayout/UserProfileLayout";

const AdminArchive = () => {
  const dispatch = useDispatch();
  const { permissionsData } = useSelector((state) => ({
    permissionsData: state.global.permissionsData,
  }));
  const access = {
    adminsMenu: permissionsData?.adminSettings?.[0],
  };
  const adminsPermission = access?.adminsMenu;
  const [isLoading, setIsLoading] = useState(true);

  const [adminsData, setAdminsData] = useState({
    data: [],
    loader: true,
    search: "",
    type: "archive",
    count: "",
    status: "",
  });
  const fetchAllAdmin = async (data) => {
    const queryParams = objectToQueryParams(
      omit(data, ["data", "loader", "count"])
    );
    const response = await dispatch(getAdmins(queryParams));
    if (response.status === 200) {
      setAdminsData((prev) => {
        return {
          ...prev,
          data: response?.data,
          loader: false,
          count: response?.count,
        };
      });
    }
  };

  useEffect(() => {
    fetchAllAdmin(adminsData);
  }, []);

  const handelUnArchive = async (id) => {
    const response = await dispatch(unArchiveAdmins({ adminId: id }));
    if (response?.status === 200) {
      fetchAllAdmin(adminsData);
      dispatch(throwSuccess(response.message));
    }
  };

  const headers = [
    {
      title: "Admin",
    },
    {
      title: "Role",
    },
    {
      title: "Status",
    },
    adminsPermission?.all && {
      title: "Action",
    },
  ];
  const rowData = [];
  adminsData?.data?.forEach((elem) => {
    const {
      profileImage,
      firstName,
      lastName,
      uid,
      role,
      status,
      _id: id,
    } = elem;
    let obj = [
      {
        value: (
          <div className="d-flex align-items-center gap-2">
            <UserProfileLayout url={profileImage} size="40" />
            <div className="">
              <div className="text-13-500-21 color-black-100">
                {titleCaseString(`${firstName} ${lastName}`)}
              </div>
              <div className="text-13-400 color-black-60 text-nowrap">
                ID: {uid}
              </div>
            </div>
          </div>
        ),
      },
      {
        value: (
          <div className="text-13-500 color-black-100">
            {titleCaseString(role)}
          </div>
        ),
      },
      {
        value: (
          <div className="d-flex gap-2">
            <span className="text-13-500 color-black-100">
              {status === 1 ? "Active" : "Inactive"}
            </span>
            {adminsPermission?.all && (
              <span>
                <StatusContainer
                  title="Admin"
                  data={elem}
                  apiFunction={async () => {
                    const payload = {
                      adminId: id,
                      status: !status,
                    };
                    return await dispatch(adminStatusUpdate(payload));
                  }}
                  handelSuccess={() => {
                    setAdminsData((prev) => {
                      let oldVal = prev?.data;
                      oldVal.map((el) => {
                        let newObj = el;
                        if (newObj?._id === elem?._id) {
                          newObj.status = elem?.status === 1 ? 0 : 1;
                        }
                        return newObj;
                      });
                      return { ...prev, data: oldVal };
                    });
                  }}
                />
              </span>
            )}
          </div>
        ),
      },
      adminsPermission?.all && {
        value: (
          <Dropdown align="end">
            <Dropdown.Toggle variant="" id="dropdown-basic">
              <img src={icons.threeDots} alt="options" className="pointer" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                href=""
                className="d-flex align-items-center gap-2 mb-1"
                onClick={() => {
                  handelUnArchive(id);
                }}
              >
                <span>
                  <img src={icons.archiveSlash} alt="details" />
                </span>
                <span className="mt-1">Unarchive Sub Admin</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ),
      },
    ];
    rowData.push({ data: obj });
  });
  return (
    <div id="admin-archive-container">
      <div className="heading-section cmb-40 cps-24 cpt-24 cpe-24">
        <div className="text-20-700 color-black-100">Archived</div>
      </div>

      <div className="opacity-75">
        <Table
          header={headers}
          rowData={rowData}
          isLoading={adminsData?.loader}
          tableData={adminsData}
        />
      </div>
    </div>
  );
};

export default AdminArchive;
