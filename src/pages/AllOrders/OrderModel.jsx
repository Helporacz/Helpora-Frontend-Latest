import Button from "components/form/Button";
import React, { useState } from "react";
import { Modal, Form } from "react-bootstrap";

const OrderModel = ({
  show,
  onHide,
  booking,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    status: booking?.status || "pending",
    confirmationDate: "",
    rejectionReason: "",
    completionNotes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Booking Status</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </Form.Group>

          {formData.status === "accepted" && (
            <Form.Group className="mb-3">
              <Form.Label>Confirmation Date</Form.Label>
              <Form.Control
                type="date"
                name="confirmationDate"
                value={formData.confirmationDate}
                onChange={handleChange}
              />
            </Form.Group>
          )}

          {formData.status === "rejected" && (
            <Form.Group className="mb-3">
              <Form.Label>Reason for Rejection</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="rejectionReason"
                placeholder="Enter reason..."
                value={formData.rejectionReason}
                onChange={handleChange}
              />
            </Form.Group>
          )}

          {formData.status === "completed" && (
            <Form.Group className="mb-3">
              <Form.Label>Completion Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="completionNotes"
                placeholder="Add completion notes..."
                value={formData.completionNotes}
                onChange={handleChange}
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="text-13-500-21 h-auto cps-20 cpe-20 cpt-10 cpb-10" onClick={onHide} btnStyle="GO"
          btnText="CANCEL"
        />
        <Button
          className="text-13-500-21 h-auto cps-20 cpe-20 cpt-10 cpb-10"
          btnStyle="PD"
          btnText="UPDATE"
          onClick={handleSubmit}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default OrderModel;
