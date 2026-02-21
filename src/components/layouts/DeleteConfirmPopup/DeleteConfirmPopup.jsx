import Button from "components/form/Button/Button";
import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { icons } from "utils/constants";

const DeleteConfirmPopup = ({ onHide, handelSuccess, apiFunction, title }) => {
  const [btnLoader, setBtnLoader] = useState(false);

  const handelDelete = async () => {
    setBtnLoader(true);
    const response = await apiFunction();
    if (response?.status === 200) {
      handelSuccess();
    }
    setBtnLoader(false);
  };

  return (
    <Modal show aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Body className="cpt-24 cpb-24">
        <div className="text-center cmb-16">
          <img src={icons.deleteX} alt="delete-x" />
        </div>
        <div className="text-17-700 color-black-100 text-center cmb-5">
          Delete {title}?
        </div>
        <div className="delete-content-block text-center cmb-24 d-flex justify-content-center">
          <div className="w-50 text-15-500 color-black-80">
            This {title} will be permanently removed from the {title} list.
          </div>
        </div>

        <div>
          <div className="d-flex justify-content-center cmb-16 text-15-500 color-black-100">
            Do you want to continue?
          </div>
          <div className="d-flex justify-content-center gap-3">
            <Button
              className="text-13-600 h-auto cps-30 cpe-30 cpt-10 cpb-10 text-15-600"
              btnStyle="GO"
              btnText="NO, CANCEL"
              onClick={onHide}
            />
            <Button
              className="text-15-600 h-auto cps-30 cpe-30 cpt-10 cpb-10 text-15-600"
              btnStyle="DO"
              btnText="YES, DELETE"
              onClick={handelDelete}
              btnLoading={btnLoader}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmPopup;
