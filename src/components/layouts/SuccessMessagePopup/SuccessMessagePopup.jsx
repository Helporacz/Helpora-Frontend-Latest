import React from "react";

const SuccessMessagePopup = ({ className, message }) => {
  return (
    <div className={className}>
      <span className="bg-white pt-1 pb-1 ps-1 pe-1 rounded">
        <i className="bi bi-check d-flex" />
      </span>
      <span className="text-14-500 color-white">{message}</span>
    </div>
  );
};

export default SuccessMessagePopup;
