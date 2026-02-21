import React from "react";
import "./LabelText.scss";

const LabelText = ({ label }) => {
  return (
    <div id="label-text-container">
      <label className="label-text text-15-500 color-black-80 w-100 pb-1">
        {label}
      </label>
    </div>
  );
};

export default LabelText;
