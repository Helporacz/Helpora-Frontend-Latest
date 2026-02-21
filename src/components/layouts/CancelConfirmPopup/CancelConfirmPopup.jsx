import Button from "components/form/Button";
import React from "react";
import { Modal } from "react-bootstrap";

const CancelConfirmPopup = ({ onHide, handleReset }) => {
  return (
    <Modal show aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Body className="cpt-24 cpb-24 text-center">
        <div className="text-15-700 color-black-100">
          Are you sure you want to cancel your progress?
        </div>
        <div className="text-13-500-21 color-black-80 cmb-15">
          Cancelling would require you to start all over again.
        </div>

        <div>
          <div className="d-flex justify-content-center cmb-16 text-13-500-21 color-black-100">
            Do you want continue this action?
          </div>
          <div className="d-flex justify-content-center gap-3">
            <Button
              className="text-13-500-21 h-auto cps-30 cpe-30 cpt-10 cpb-10"
              btnStyle="GO"
              btnText="YES, CANCEL"
              onClick={handleReset}
              // btnLoading={btnLoader}
            />
            <Button
              className="text-13-500-21 h-auto cps-20 cpe-20 cpt-10 cpb-10"
              btnStyle="PD"
              btnText="NO, DON'T CANCEL"
              onClick={onHide}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CancelConfirmPopup;
