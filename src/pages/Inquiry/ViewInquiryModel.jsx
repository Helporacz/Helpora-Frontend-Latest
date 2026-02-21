import React from "react";
import { Modal } from "react-bootstrap";

const ViewInquiryModel = ({ show, onHide, selectedInquiry }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Inquiry Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>
            <strong>Name:</strong> {selectedInquiry?.name || "-"}
          </p>
          <p>
            <strong>Email:</strong> {selectedInquiry?.email || "-"}
          </p>
          <p>
            <strong>Subject:</strong> {selectedInquiry?.subject || "-"}
          </p>
          <p>
            <strong>Message:</strong> {selectedInquiry?.message || "-"}
          </p>
          <p>
            <strong>Submitted At:</strong>{" "}
            {selectedInquiry?.createdAt
              ? new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(selectedInquiry.createdAt))
              : "-"}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="px-3 py-1"
          style={{ border: "none", borderRadius: "12px" }}
          onClick={onHide}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewInquiryModel;
