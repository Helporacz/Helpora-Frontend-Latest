import React from "react";
import LabelText from "../LabelText";
import "./TextArea.scss";

const TextArea = ({
  label,
  placeholder,
  error,
  onChange,
  id,
  value,
  isRequired,
  maxLength,
}) => {
  return (
    <div id="text-area-container">
      {label && <LabelText label={label} required={isRequired} />}
      <textarea
        rows={3}
        placeholder={placeholder}
        className="text-input-area"
        onChange={onChange}
        id={id}
        value={value}
      />
      {error && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </span>
      )}
    </div>
  );
};

export default TextArea;
