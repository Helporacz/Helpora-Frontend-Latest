import React from "react";
import { useState } from "react";
import LabelText from "../LabelText";
import "./PasswordInput.scss";

const PasswordInput = ({ placeholder, label, id, onChange, error, value }) => {
  const [passwordType, setPasswordType] = useState("password");

  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  };

  return (
    <div id="password-input-container">
      <LabelText label={label} />
      <div className="password-input-block">
        <input
          id={id}
          type={passwordType}
          className="password-input"
          placeholder={placeholder}
          onChange={onChange}
          value={value}
        />
        <span className="eye-container" onClick={togglePassword}>
          {passwordType === "password" ? (
            <i className="hide-eye bi bi-eye-slash" />
          ) : (
            <i className="visible-eye bi bi-eye" />
          )}
        </span>
      </div>
      {error && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </span>
      )}
      {/* <div className="text-12-400 color-carnation"></div> */}
    </div>
  );
};

export default PasswordInput;
