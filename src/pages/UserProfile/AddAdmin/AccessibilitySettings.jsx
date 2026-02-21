import Button from "components/form/Button";
import CheckBox from "components/form/CheckBox";
import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { icons } from "utils/constants";

const AccessibilitySettings = ({ onHide }) => {
  const [data, setData] = useState([
    {
      key: "Dashboard",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
    {
      key: "Beauticians",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
    {
      key: "Clients",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
    {
      key: "Products",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
    {
      key: "Brands",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
    {
      key: "Gists",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
    {
      key: "Promotions",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
    {
      key: "Admins",
      value: [
        {
          key: "All action",
          isCheck: false,
        },
        {
          key: "View only",
          isCheck: false,
        },
        {
          key: "View & download",
          isCheck: false,
        },
      ],
    },
  ]);
  return (
    <Modal
      show
      onHide={onHide}
      dialogClassName="modal-90w"
      aria-labelledby="example-custom-modal-styling-title"
    >
      <Modal.Header>
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="text-20-700 color-dashboard-primary">
            <span>
              <img
                src={icons.closeSquare}
                alt="close"
                className="me-3 pointer"
                onClick={() => {
                  onHide();
                }}
              />
            </span>
            <span>User Accessibility Settings</span>
          </div>
          <div>
            <Button
              btnText="APPLY CHANGES"
              btnStyle="PD"
              className="cps-20 cpe-20"
            />
          </div>
        </div>
        {/* <Modal.Title id="example-custom-modal-styling-title">
         
        </Modal.Title> */}
      </Modal.Header>
      <Modal.Body>
        <div className="row cps-10 cpe-10">
          {data.map((elem, pIndex) => {
            return (
              <div key={pIndex} className="col-md-4 cmb-40">
                <div className="text-17-700 color-dashboard-primary">
                  {elem.key}
                </div>
                <div className="border rounded cps-10 cpe-10 cpt-10">
                  {elem.value.map((cElem, cIndex) => {
                    return (
                      <React.Fragment key={cIndex}>
                        <CheckBox
                          label={cElem.key}
                          isCheck={cElem.cIndex}
                          onChange={() => {
                            setData((prev) => {
                              let newData = prev;
                              newData[pIndex].value[cIndex].isCheck =
                                !prev[pIndex].value[cIndex].isCheck;
                              return newData;
                            });
                          }}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
};
export default AccessibilitySettings;
