import { Dropdown } from "react-bootstrap";
import "./MenuOption.scss";

const MenuOption = ({
  icon,
  option,
  onClick,
  onChange,
  data,
  headers,
  filename,
}) => {
  return (
    <div id="menu-option-container">
      <Dropdown align="end">
        <Dropdown.Toggle variant="" id="dropdown-basic">
          {icon}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {option?.map((elem, key) => {
            return (
              <Dropdown.Item
                key={key}
                href=""
                className="d-flex align-items-center gap-2 mb-1"
                onClick={elem.onClick}
              >
                {elem.icon && <span>{elem.icon}</span>}
                <span className="mt-1">{elem.text}</span>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
export default MenuOption;
