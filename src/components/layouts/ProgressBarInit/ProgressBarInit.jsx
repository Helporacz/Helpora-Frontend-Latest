import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import "./ProgressBarInit.scss";
import { icons } from "utils/constants";

const ProgressBarInit = ({ loadingValue }) => {
  return (
    <div
      id="progress-bar-container"
      className="d-flex justify-content-center align-items-center vh-100 flex-column"
    >
      <div className="logo-container cmb-50">
        <img src={icons.logo} alt="logo" />
      </div>
      <div className="w-50 cmb-50">
        <ProgressBar now={loadingValue} label={`${loadingValue}%`} />
      </div>

      <div className="progress-text">Initialization...</div>
    </div>
  );
};

export default ProgressBarInit;
