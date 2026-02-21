import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import TextInput from "../../form/TextInput";
import DatePicker from "../../form/DatePicker";
import SelectDropdown from "../../form/Dropdown";
import { icons } from "utils/constants";

const CustomToggle = React.forwardRef(
  ({ placeholder, value, onClick, onChange, field }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="d-flex justify-content-between gap-2 cps-10 cpt-16 cpb-16 cpe-10 pointer w-100"
    >
      <span className="search-icon">
        <img src={icons.searchGray} alt="search" />
      </span>
      <span>
        <TextInput
          onChange={() => {}}
          value={value || placeholder}
          className={`table-search ${
            value ? "color-black-olive" : "color-quick-silver"
          }`}
        />
      </span>

      <span className="flex-grow-1 d-flex justify-content-end">
        {value && (
          <i
            className="bi bi-x-lg text-15-500"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ target: { id: field, value: "" } });
            }}
          />
        )}
      </span>
    </div>
  )
);

const CustomMenu = React.forwardRef(
  (
    {
      id,
      value,
      style,
      options,
      onChange,
      className,
      optionKey,
      placeholder,
      optionValue,
      isDatePicker,
      isSearchDropdown,
      "aria-labelledby": labeledBy,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        {isSearchDropdown ? (
          <SelectDropdown
            id={id}
            value={value}
            options={options}
            onChange={onChange}
            optionKey={optionKey}
            optionValue={optionValue}
            placeholder={placeholder}
            isClearable
          />
        ) : isDatePicker ? (
          <DatePicker
            placeholder={placeholder}
            id={id}
            onChange={onChange}
            value={value}
            isClearable
          />
        ) : (
          <TextInput
            id={id}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            autoFocus
          />
        )}
      </div>
    );
  }
);

const TableSearch = ({
  id,
  value,
  options,
  onChange,
  optionKey,
  placeholder,
  optionValue,
  isDatePicker,
  isSearchDropdown,
}) => {
  let dropdownValue = "";
  if (isSearchDropdown && value) {
    dropdownValue = options.find((o) => o.id + "" === value + "")?.[
      optionValue
    ];
  }
  return (
    <Dropdown>
      <Dropdown.Toggle
        field={id}
        as={CustomToggle}
        onChange={onChange}
        placeholder={placeholder}
        id="dropdown-custom-components"
        value={isSearchDropdown ? dropdownValue : value}
      />
      <Dropdown.Menu
        id={id}
        value={value}
        as={CustomMenu}
        options={options}
        onChange={onChange}
        optionKey={optionKey}
        placeholder={placeholder}
        optionValue={optionValue}
        isDatePicker={isDatePicker}
        isSearchDropdown={isSearchDropdown}
        className="cps-10 cpe-10 unset-br border-0 shadow"
      />
    </Dropdown>
  );
};
export default TableSearch;
