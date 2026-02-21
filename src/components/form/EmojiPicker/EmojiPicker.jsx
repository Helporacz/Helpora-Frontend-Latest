import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "./EmojiPicker.scss";
import { emojiList, emojiOptions } from "utils/constants/emoji";
import { icons } from "utils/constants";

const EmojiPicker = ({ id, onChange }) => {
  const [type, setType] = useState("0");
  let emojiData = emojiList[type];
  let activeOption = "active-block cpt-5 cpb-5 cps-6 cpe-6 pointer";
  let inactiveOption = "cpt-5 cpb-5 cps-6 cpe-6 pointer";
  return (
    <div id="emoji-picker-container">
      <Dropdown>
        <Dropdown.Toggle id="dropdown-basic">
          <div className="flex-grow-1">
            <img src={icons.emoji} alt="emoji" className="emoji" />
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <div className="cps-10 cpe-10">
            <div>
              {emojiOptions?.map((elem, index) => {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      setType(elem.id);
                    }}
                    className={`text-14-400 ${
                      type === elem.id ? activeOption : inactiveOption
                    }`}
                  >
                    {elem.title}
                  </span>
                );
              })}
            </div>
            <div className="d-flex flex-wrap gap-1 mt-3 iferp-scroll emoji-list-container cps-5">
              {emojiData?.map((elm, index) => {
                const { emoji } = elm;
                return (
                  <span
                    key={index}
                    className="pointer text-12-400"
                    onClick={() => {
                      onChange({
                        data: elm,
                        value: emoji,
                        id: id,
                      });
                    }}
                  >
                    {emoji}
                  </span>
                );
              })}
            </div>
          </div>
        </Dropdown.Menu>
      </Dropdown>
      {/* <i className="bi bi-emoji-smile" />
      <div className="d-flex flex-wrap gap-3">
        {options?.map((elem, index) => {
          return (
            <span
              key={index}
              onClick={() => {
                setType(elem.id);
              }}
              className={`${type === elem.id ? activeOption : inactiveOption}`}
            >
              {elem.title}
            </span>
          );
        })}

        <div className="d-flex flex-wrap gap-1">
          {emojiList?.map((elm, index) => {
            const { emoji } = elm;
            return (
              <span key={index} className="pointer">
                {emoji}
              </span>
            );
          })}
        </div>
      </div> */}
    </div>
  );
};

export default EmojiPicker;
