import LabelText from "components/form/LabelText";
import "./DisabledField.scss";

const DisabledField = ({ label, value }) => {
  return (
    <div id="disabled-field-container">
      <LabelText label={label} />
      <div className="disabled-value-input">{value}</div>
    </div>
  );
};
export default DisabledField;
