import React from "react";
import "./DownloadButton.scss";
const DownloadButton = ({ icon, val }) => {
  return (
    <div id="download-btn-block">
      <button
        type="button"
        className="download-button cps-18 cpt-10 cpb-10 cpe-16"
      >
        {icon}
        {val}
      </button>
    </div>
  );
};

export default DownloadButton;
