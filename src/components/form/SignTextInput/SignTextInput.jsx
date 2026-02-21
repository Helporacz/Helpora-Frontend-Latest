import React from "react";
import LabelText from "../LabelText";
import "./SignTextInput.scss";

const SignTextInput = ({
  placeholder,
  label,
  id,
  onChange,
  value,
  signValue,
  error,
}) => {
  return (
    <div id="sign-text-input-container">
      <LabelText label={label} />
      <div className="input-icon">
        <div className="sign-block text-nowrap">{signValue}</div>
        <div className="saprator-block" />
        <input
          type="text"
          className="text-sign-input text-15-500 color-black-100"
          id={id}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
          autoComplete="off"
        />
      </div>
      {error && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </span>
      )}
    </div>

    // <div id="text-input-container">
    //   <LabelText label={label} />
    //   <div>
    //     <input type="text" value={signValue} />
    //     <input
    //       id={id}
    //       onChange={onChange}
    //       type="text"
    //       placeholder={placeholder}
    //       className="text-input text-15-500 color-black-100"
    //       value={value}
    //     />
    //     <i>Discount (%)</i>
    //     {error && (
    //       <span className="text-13-500 pt-1">
    //         <span style={{ color: "red" }}>{error}</span>
    //       </span>
    //     )}
    //   </div>
    // </div>
  );
};

export default SignTextInput;
