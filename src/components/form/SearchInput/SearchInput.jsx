import { icons } from "utils/constants";
import "./SearchInput.scss";

const SearchInput = ({
  placeholder,
  value,
  onChange,
  className,
  id,
  searchWidth,
}) => {
  return (
    <div id={searchWidth ? "searchWidth" : "search-input-container"}>
      <input
        id={id}
        type="text"
        onChange={onChange}
        placeholder={placeholder}
        value={value}
        className={className}
      />
      <img src={icons.search} alt="search" className="searc-icon-block" />
    </div>
  );
};
export default SearchInput;
