import "./CheckBox.scss";

const CheckBox = ({ label, checked, onChange, id, value, className }) => {
  return (
    <div id="check-box-container">
      <div className="check-form">
        <input
          className={className ? className : `form-check-input`}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          id={id}
          value={value}
        />
        {label && (
          <label className="form-check-label text-13-600">{label}</label>
        )}
      </div>
    </div>
  );
};
export default CheckBox;
