import { useState } from "react";
import "./Profile.scss";

const Profile = ({
  text,
  url,
  className,
  isRounded,
  size = "s-52",
  bgColor = "bg-black-40",
  textColor = "color-white",
}) => {
  let displayText = "";
  const [isImageError, setisImageError] = useState(false);
  if (text) {
    displayText = text
      .split(/\s/)
      .reduce((response, word) => (response += word.slice(0, 1)), "");
    displayText = displayText.substring(0, 1).toUpperCase();
  }
  const pClass = `center-flex ${className} ${bgColor} ${size} ${textColor} ${
    isRounded ? "rounded-circle" : "rounded"
  }`;
  return (
    <div id="profile-container">
      {url && !isImageError ? (
        <div className={`profile-block-data ${pClass} bg-white`}>
          <img
            src={url}
            alt={"user-profile"}
            className={`fill fit-image ${
              isRounded ? "rounded-circle" : "rounded"
            }`}
            onError={() => {
              setisImageError(true);
            }}
          />
        </div>
      ) : (
        <div className={`profile-block-data ${pClass}`}>{displayText}</div>
      )}
    </div>
  );
};
export default Profile;
