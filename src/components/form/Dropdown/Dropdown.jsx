import Select from "react-select";
import Label from "../LabelText";
import "./Dropdown.scss";
const Dropdown = ({
  value,
  placeholder,
  options,
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
  defaultValue,
}) => {
  const optId = optionKey || "id";
  const optVal = optionValue || "label";

  let fillValue = options.find((o) => `${o[optId]}` === `${value}`);
  if (!fillValue) {
    fillValue = null;
  }
  return (
    <div id="Dropdown-container">
      {label && (
        <Label label={label} required={isRequired} className={labelClass} />
      )}
      <Select
        // defaultValue={defaultValue}
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

      {error && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </span>
      )}
    </div>
  );
};
export default Dropdown;
