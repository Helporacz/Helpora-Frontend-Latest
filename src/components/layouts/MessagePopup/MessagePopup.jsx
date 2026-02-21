import React from "react";
import { Modal } from "react-bootstrap";
import "./MessagePopup.scss";

const MessagePopup = ({ show, onHide, title, message, type = "success" }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "✓";
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      case "info":
        return "Information";
      default:
        return "Message";
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="message-popup-modal">
      <Modal.Body className={`message-popup-body message-popup-${type}`}>
        <div className="message-popup-content">
          <div className={`message-icon message-icon-${type}`}>
            {getIcon()}
          </div>
          <h5 className="message-title">{getTitle()}</h5>
          <p className="message-text">{message}</p>
          <button
            onClick={onHide}
            className={`message-button message-button-${type}`}
          >
            OK
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MessagePopup;

