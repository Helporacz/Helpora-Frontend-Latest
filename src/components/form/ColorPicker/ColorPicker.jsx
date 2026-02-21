import React from "react";
import "./ColorPicker.scss";
import LabelText from "../LabelText";

const ColorPicker = ({
  label,
  id,
  onChange,
  onClick,
  value,
  error,
  disabled,
}) => {
  return (
    <div id="color-input-container">
      <LabelText label={label} />
      <div className="d-flex flex-column">
        <input
          id={id}
          onChange={onChange}
          type="color"
          className="color-input text-15-500 color-black-100"
          value={value}
          disabled={disabled}
          autoComplete="off"
          onClick={onClick}
        />

        {error && (
          <span className="text-13-500 pt-1">
            <span style={{ color: "red" }}>{error}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
