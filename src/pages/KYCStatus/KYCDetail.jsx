import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getKycByIdAdmin, reviewKycAdmin } from "store/globalSlice";
import { getLocalizedPath } from "utils/localizedRoute";

const KYCDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [actionType, setActionType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusBadge = (status) => {
    const map = {
      draft: "secondary",
      submitted: "info",
      resubmit: "warning",
      approved: "success",
      rejected: "danger",
    };
    return (
      <Badge bg={map[status] || "secondary"}>{status?.toUpperCase()}</Badge>
    );
  };

  const fetchDetail = async () => {
    setLoading(true);
    const res = await dispatch(getKycByIdAdmin(id));
    if (res?.status === 200) {
      setKyc(res.kyc);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const openModal = (action) => {
    setActionType(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActionType(null);
    setReviewNote("");
  };

  const handleAction = async () => {
    if (!actionType) return;
    if (actionType !== "approve" && !reviewNote.trim()) return;
    setActionLoading(true);
    const res = await dispatch(
      reviewKycAdmin({ id, action: actionType, adminReviewNotes: reviewNote })
    );
    if (res?.status === 200) {
      setKyc(res.kyc);
      closeModal();
      
      if (actionType === "approve") {
        const cameFromApproval = location.state?.from === "kyc-approval";
        if (cameFromApproval) {
          navigate(getLocalizedPath("/kyc-approval", i18n.language));
        } else {
          navigate(getLocalizedPath("/approve-kyc", i18n.language));
        }
      }
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!kyc) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">KYC not found</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center gap-3 mb-3">
        <h3 className="m-0">KYC Detail</h3>
        {statusBadge(kyc.status)}
      </div>

      {kyc.adminReviewNotes && (
        <Alert variant="warning">
          <strong>Admin Note:</strong> {kyc.adminReviewNotes}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title><h3>Personal Details</h3></Card.Title>
              <p>
                <strong>Name:</strong> {kyc.personalDetails?.fullName}
              </p>
              <p>
                <strong>Email:</strong> {kyc.personalDetails?.email}
              </p>
              <p>
                <strong>DOB:</strong>{" "}
                {kyc.personalDetails?.dob
                  ? new Date(kyc.personalDetails.dob).toLocaleDateString()
                  : "-"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {kyc.personalDetails?.phoneNumber || "-"}
              </p>
              <p>
                <strong>Address:</strong> {kyc.personalDetails?.address || "-"}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title><h3>Documents</h3></Card.Title>
              <p>
                <strong>Proof of Identity:</strong>{" "}
                {kyc.documents?.identityProof ? (
                  <a
                    href={kyc.documents.identityProof}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                ) : (
                  "-"
                )}
              </p>
              <p>
                <strong>Proof of Address:</strong>{" "}
                {kyc.documents?.addressProof ? (
                  <a
                    href={kyc.documents.addressProof}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {kyc.status !== "approved" && (
        <div>
          <div>
            <div className="d-flex gap-2">
              <button
                disabled={actionLoading}
                onClick={() => openModal("approve")}
                className="px-4 py-2"
                style={{
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "green",
                  color:"white"
                }}
              >
                Approve
              </button>
              <button
                disabled={actionLoading}
                onClick={() => openModal("resubmit")}
                className="px-4 py-2"
                style={{
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "yellow",
                  color:"black"
                }}
              >
                Request Resubmit
              </button>
              <button
                disabled={actionLoading}
                onClick={() => openModal("reject")}
                className="px-4 py-2"
                style={{
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "red",
                  color:"white"
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === "approve"
              ? "Approve KYC"
              : actionType === "resubmit"
              ? "Request Resubmit"
              : "Reject KYC"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === "approve" ? (
            <p>Are you sure you want to approve this KYC?</p>
          ) : (
            <Form.Group>
              <Form.Label>Admin Notes (required)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add notes for provider"
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            variant="secondary"
            onClick={closeModal}
            disabled={actionLoading}
            className="px-4 py-2"
            style={{
              border: "none",
              borderRadius: "10px",
              backgroundColor: "gray",
              color:"white"
            }}
          >
            Cancel
          </button>
          <button
            variant={
              actionType === "approve"
                ? "success"
                : actionType === "resubmit"
                ? "warning"
                : "danger"
            }
            onClick={handleAction}
            disabled={
              actionLoading || (!reviewNote.trim() && actionType !== "approve")
            }
            className="px-4 py-2"
            style={{
              border: "none",
              borderRadius: "10px",
              backgroundColor: "green",
              color:"white"
            }}
          >
            {actionLoading ? "Processing..." : "Confirm"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KYCDetail;
