import React from "react";
import "./RadioButton.scss";

const RadioButton = ({
  id,
  label,
  checked,
  value,
  onChange,
  defaultChecked,
  error,
  name,
}) => {
  return (
    <div id="round-radio-box-container">
      <div className="form-check">
        <input
          id={id}
          className="form-check-input"
          type="radio"
          checked={checked}
          value={value}
          // checked={checked === value}
          onChange={onChange}
          name={name}
          // onChange={() => setter(value)}
        />
        {label && (
          <label className="form-check-label text-15-500">{label}</label>
        )}
        {error && (
          <span className="text-13-500 pt-1">
            <span style={{ color: "red" }}>{error}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default RadioButton;
