import React from "react";
import "./SortButton.scss";

const SortButton = ({ icon, val }) => {
  return (
    <div id="sort-btn-block">
      <button type="button" className="sort-button cps-16 cpt-10 cpb-10 cpe-22">
        {val} {icon}
      </button>
    </div>
  );
};

export default SortButton;
