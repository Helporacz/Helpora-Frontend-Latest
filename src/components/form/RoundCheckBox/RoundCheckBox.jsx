import React from "react";
import "./RoundCheckBox.scss";

const RoundCheckBox = ({ label, checked, onChange, id }) => {
  return (
    // <div id="round-check-box-container">
    //   <div className="round-form-check">
    //     <input
    //       className="round-form-check-input"
    //       type="checkbox"
    //       id={id}
    //       checked={checked}
    //       onChange={onChange}
    //     />
    //     {label && (
    //       <label className="form-check-label text-15-500">{label}</label>
    //     )}
    //   </div>
    // </div>
    <div className="round">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <label htmlFor={id} />
    </div>
  );
};

export default RoundCheckBox;
