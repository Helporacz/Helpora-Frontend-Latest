import { icons } from "utils/constants";
import "./UserProfileLayout.scss";
import { useState } from "react";

const UserProfileLayout = ({ url, text, status, size, isSquare }) => {
  let statusColor = "#CFCFCF";
  switch (status) {
    case "0":
      statusColor = "#CFCFCF";
      break;
    case "1":
      statusColor = "#FFD14C";
      break;
    case "2":
      statusColor = "#219653";
      break;
    case "3":
      statusColor = "#c12525";
      break;
    default:
      statusColor = "";
      break;
  }
  let newUrl = url;
  if (!text && !url) {
    newUrl = icons.userDefaultImage;
  }
  let displayText = "";
  const [isImageError, setisImageError] = useState(false);
  if (text) {
    displayText = text
      .split(/\s/)
      .reduce((response, word) => (response += word.slice(0, 1)), "");
    displayText = displayText.substring(0, 2).toUpperCase();
  }
  return (
    <div id="user-profile-layout-container">
      <div
        className={`user-image-block size-${size || 50} ${
          isSquare ? "square-profile" : ""
        }`}
      >
        {newUrl && !isImageError ? (
          <img
            src={newUrl}
            alt="user-profile"
            className="fill-image"
            onError={() => {
              setisImageError(true);
            }}
          />
        ) : (
          <div className="text-profile-block">{displayText}</div>
        )}
        {statusColor && (
          <div
            className="status-indi"
            style={{ backgroundColor: statusColor }}
          />
        )}
      </div>
    </div>
  );
};
export default UserProfileLayout;
