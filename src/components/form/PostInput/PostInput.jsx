import { icons } from "utils/constants";
import MenuOption from "components/layouts/MenuOption";
import "./PostInput.scss";

const PostInput = ({ label }) => {
  return (
    <div id="post-input-container">
      <div className="text-15-600 color-dashboard-primary">{label}</div>
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-grow-1 gist-input">
          <img src={icons.emoji} alt="emoji" className="emoji" />
          <input type="text" placeholder="Message" />
        </div>
        <div className="d-flex gap-2">
          <div>
            <img src={icons.voiceIcon} alt="record" className="pointer" />
          </div>
          <div>
            <MenuOption
              icon={<img src={icons.addIcon} alt="add" className="pointer" />}
              option={[
                {
                  icon: <img src={icons.galleryIcon} alt="hide" />,
                  text: "Photo & Video files",
                  onClick: () => {},
                },
                {
                  icon: <img src={icons.folderIcon} alt="delete" />,
                  text: "Document",
                  onClick: () => {},
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default PostInput;
