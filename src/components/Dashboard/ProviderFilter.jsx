import React from "react";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";
import "./ProviderFilter.scss";

const ProviderFilter = ({ providers, selectedProvider, onChange, placeholder = "Select a provider..." }) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "38px",
      borderColor: state.isFocused ? "#007bff" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0, 123, 255, 0.25)" : "none",
      "&:hover": {
        borderColor: "#007bff",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "2px 8px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const CustomOption = ({ innerProps, label, data }) => (
    <div {...innerProps} className="provider-option">
      <div>
        <div className="provider-name">{label}</div>
      </div>
    </div>
  );

  const formatOptionLabel = ({ label, value }) => {
    if (!value) return label;
    return (
      <div className="provider-option-label">
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="provider-filter-container">
      <Select
        value={selectedProvider}
        onChange={onChange}
        options={providers}
        isSearchable
        placeholder={placeholder}
        className="provider-select"
        classNamePrefix="provider-select"
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        components={{
          Option: CustomOption,
        }}
      />
      {selectedProvider && selectedProvider.value && (
        <button
          className="clear-provider-btn"
          onClick={() => onChange(null)}
          aria-label="Clear provider selection"
        >
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
};

export default ProviderFilter;

