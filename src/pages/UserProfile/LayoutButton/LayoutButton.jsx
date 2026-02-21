import "./LayoutButton.scss";

const LayoutButton = ({ text, leftIcon, rightIcon, className, onClick }) => {
  return (
    <div id="layout-button-container" className={className} onClick={onClick}>
      {leftIcon && <span>{leftIcon}</span>}
      {text && <span>{text}</span>}
      {rightIcon && <span>{rightIcon}</span>}
    </div>
  );
};
export default LayoutButton;
