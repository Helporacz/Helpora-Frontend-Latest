import "./SwitchBox.scss";

const SwitchBox = ({ checked, onChange }) => {
  return (
    <div id="switch-box-container">
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
          checked={checked}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
export default SwitchBox;
