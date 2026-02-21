import Button from "components/form/Button";
import SwitchBox from "components/form/SwitchBox";
import { useState } from "react";
import { Modal } from "react-bootstrap";

const StatusContainer = ({ data = {}, title, handelSuccess, apiFunction }) => {
  let { status } = data;
  const [btnLoader, setBtnLoader] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const handelStatus = async () => {
    setBtnLoader(true);
    const response = await apiFunction();
    if (response?.status === 200) {
      setPopupData(null);
      handelSuccess();
    }
    setBtnLoader(false);
  };
  const handelActiveInactive = (e) => {
    if (e) {
      setPopupData({
        title: `You are about to deactivate this ${title}`,
        subtitle: `This ${title} will remain inactive on this platform until this action is undone.`,
        rightButton: "YES, DEACTIVATE",
        value: false,
        id: e._id,
      });
    } else {
      setPopupData({
        title: `You are about to activate this ${title}`,
        subtitle: `This ${title} will be active on this platform.`,
        rightButton: "YES, ACTIVATE",
        value: true,
        id: e._id,
      });
    }
  };

  return (
    <div className="d-flex gap-2">
      {popupData && (
        <Modal
          size="sm"
          aria-labelledby="contained-modal-title-vcenter"
          dialogClassName="modal-409"
          centered
          show
        >
          <Modal.Body className="cps-24 cpe-24 cpt-24 cpb-24">
            <div className="text-15-700 color-black-100">
              {popupData?.title}
            </div>
            <div className="text-13-500 color-black-80 cmb-24">
              {popupData?.subtitle}
            </div>
            <div className="text-13-500 color-black-100 cmb-16">
              Do you want continue this action?
            </div>
            <div className="d-flex justify-content-center gap-3">
              <Button
                btnText="NO, CANCEL"
                btnStyle="PLO"
                className="cps-20 cpe-20 pt-2 pb-1 h-auto text-nowrap"
                onClick={() => {
                  setPopupData(null);
                }}
              />
              <Button
                btnText={popupData?.rightButton}
                btnStyle="PD"
                className="cps-20 cpe-20 pt-2 pb-1 h-auto text-nowrap"
                onClick={handelStatus}
                btnLoading={btnLoader}
              />
            </div>
          </Modal.Body>
        </Modal>
      )}
      <span>
        <SwitchBox
          checked={status}
          onChange={() => {
            handelActiveInactive(status);
          }}
        />
      </span>
    </div>
  );
};
export default StatusContainer;
