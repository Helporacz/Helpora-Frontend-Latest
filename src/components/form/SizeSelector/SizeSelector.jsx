import React from "react";
import LabelText from "../LabelText/LabelText";
import Select from "react-select";
import "./SizeSelector.scss";

const SizeSelector = ({
  value,
  placeholder,
  options,
  errorUnit,
  error,
  id,
  optionKey,
  optionValue,
  onChange,
  isLoading,
  disabled,
  name,
  extraDisplayKey,
  isClearable,
  label,
  isRequired,
  labelClass,
  isSearchable = true,
  onMenuScrollToBottom,
  onInputChange,
  textInput,
  textId,
}) => {
  const optId = optionKey || "id";
  const optVal = optionValue || "label";

  let fillValue = options.find((o) => `${o[optId]}` === `${value}`);
  if (!fillValue) {
    fillValue = null;
  }
  return (
    <div id="size-selector-container">
      <LabelText label={label} />
      <div className="size-select-input">
        <Select
          onChange={(e) => {
            onChange({
              target: {
                id: id,
                value: e ? e[optId] : "",
                data: e,
              },
            });
          }}
          getOptionLabel={(option) => {
            if (extraDisplayKey) {
              return `${option[optVal] || ""} ${
                option[extraDisplayKey] ? `- ${option[extraDisplayKey]}` : ""
              }`;
            } else {
              return option[optVal];
            }
          }}
          getOptionValue={(option) => option[optId]}
          placeholder={placeholder}
          className={`basic-single ${value ? "" : "placehoder-val"}`}
          classNamePrefix="select"
          value={fillValue}
          isDisabled={disabled}
          isLoading={isLoading}
          name={name}
          options={options}
          isClearable={isClearable}
          isSearchable={isSearchable}
          onMenuScrollToBottom={onMenuScrollToBottom}
          onInputChange={(text, event) => {
            if (onInputChange && event?.action === "input-change") {
              onInputChange(text);
            }
          }}
          // menuIsOpen
        />

        <div className="select-size-input">
          <div className="size-input-block">
            <input
              id={textId}
              onChange={onChange}
              type="text"
              placeholder={placeholder}
              className="text-input text-15-500 color-black-100"
              value={textInput}
            />
          </div>
        </div>
      </div>
      {errorUnit && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{errorUnit} </span>
        </span>
      )}
      {errorUnit && error && (
        <span style={{ color: "red" }} className="text-13-500 pt-1">
          and{" "}
        </span>
      )}
      {error && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </span>
      )}
    </div>
  );
};

export default SizeSelector;
