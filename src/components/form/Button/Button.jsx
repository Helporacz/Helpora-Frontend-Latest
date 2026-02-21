import { icons } from "utils/constants";
import "./Button.scss";
import Loader from "components/layouts/Loader";

const Button = ({
  type,
  className,
  onClick,
  leftIcon,
  btnStyle,
  rightIcon,
  btnText,
  iconType,
  btnLoading,
  disabled,
}) => {
  let newLeftIcon = "";
  let newRightIcon = "";
  switch (iconType) {
    case "R-Filter":
      newRightIcon = icons.Sort;
      break;
    case "R-Arrow":
      newRightIcon = icons.arrowRight;
      break;
    case "L-BlackArchive":
      newLeftIcon = icons.archiveBlack;
      break;
    case "L-Archive":
      newLeftIcon = icons.archive;
      break;
    case "L-Download":
      newLeftIcon = icons.downloadPrimary;
      break;
    case "L-Download-White":
      newLeftIcon = icons.Download;
      break;
    case "L-Add":
      newLeftIcon = icons.addSquare;
      break;
    case "Edit-pen":
      newLeftIcon = icons.editPen;
      break;
    default:
      newLeftIcon = "";
      newRightIcon = "";
      break;
  }

  let styleObject = {
    DD: "disabled-dark",
    BDD: "black-disabled-dark",
    PD: "primary-dark",
    PO: "primary-outline",
    PLO: "primary-lignt-outline",
    BO: "black-outline",
    DO: "delete-orange",
    GO: "gray-outline",
    BD: "blue-dark",
    PW: "primary-white",
    LB: "light-blue",
    BLB: "blue-light-border",
    LSB: "light-sky-blue",
  };
  let newBtnSrtyle = styleObject[btnStyle] || "disabled-dark";
  return (
    <div id="button-container" className={className || ""}>
      <button
        type={type || "button"}
        className={newBtnSrtyle}
        onClick={onClick}
        disabled={disabled}
        style={{display:"flex",alignItems:"center",gap:"6px"}}
      >
        {leftIcon && <span className="me-2">{leftIcon}</span>}
        {newLeftIcon && (
          <span className="me-2">
            <img src={newLeftIcon} alt="icon" />
          </span>
        )}
        {btnText && <span>{btnText}</span>}
        {newRightIcon && (
          <span className="ms-2">
            <img src={newRightIcon} alt="icon" />
          </span>
        )}
        {rightIcon && <span className="ms-2">{rightIcon}</span>}
        {btnLoading && (
          <span className="ms-2">
            <Loader size="sm" />
          </span>
        )}
      </button>
    </div>
  );
};
export default Button;
