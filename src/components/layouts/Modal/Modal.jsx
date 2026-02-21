import BootrsapModal from "react-bootstrap/Modal";
import "./Modal.scss";

const Modal = ({ children, onHide, width, title, size }) => {
  let newWidth = window.innerWidth < 700 ? "100%" : width || "600px";
  return (
    <BootrsapModal
      className="iferp-scroll modal-block-custom"
      onHide={onHide}
      size={size || "lg"}
      centered
      show
    >
      <BootrsapModal.Body id="modal-container" style={{ minWidth: newWidth, maxWidth: newWidth }}>
        {onHide && (
          <i className="bi bi-x modal-close-button pointer" onClick={onHide} />
        )}
        {title && (
          <div className="col-md-12 text-center d-flex justify-content-center mb-4">
            <h4 className="text-24-700 color-black-100 mb-0">{title}</h4>
          </div>
        )}

        <div className="modal-content-wrapper">
          {children}
        </div>
      </BootrsapModal.Body>
    </BootrsapModal>
  );
};

export default Modal;
