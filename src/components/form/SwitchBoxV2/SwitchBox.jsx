import "./SwitchBox.scss";

const SwitchBox = ({ isChecked, onChange }) => {
  return (
    <div id="switch-box-container">
      <div className="form-check form-switch">
        <input
          className="form-check-input pointer"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
          checked={isChecked}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
export default SwitchBox;
