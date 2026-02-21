import React, { useEffect, useState } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { trimLeftSpace } from "utils/helpers";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./TextEditor.scss";
import LabelText from "../LabelText";

const TextEditor = ({
  placeholder,
  id,
  onChange,
  value,
  error,
  height,
  readOnly,
  label,
  required,
  isReset,
  isHideOption,
  setIsReset,
}) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const onChangeEditor = (newState) => {
    const currentContentState = editorState.getCurrentContent();
    const newContentState = newState.getCurrentContent();
    setEditorState(newState);
    if (currentContentState !== newContentState) {
      let val = draftToHtml(convertToRaw(newContentState));
      val = val
        .replace("<p></p>", "")
        .replace("<ul><li></li></ul>", "")
        .replace("<ol><li></li></ol>", "");
      onChange({
        target: {
          id: id,
          value: trimLeftSpace(val),
        },
      });
    }
  };

  useEffect(() => {
    if (value) {
      const contentBlock = htmlToDraft(value);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(
          contentBlock.contentBlocks
        );
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState);
      }
    }
  }, [isReset]);

  useEffect(() => {
    if (!value) {
      setEditorState(EditorState.createEmpty());
    }
    if (setIsReset) {
      setIsReset();
    }
  }, [value]);

  let options = isHideOption
    ? []
    : [
        "inline",
        "blockType",
        "list",
        "textAlign",
        "colorPicker",
        "history",
        "emoji",
        "link",
      ];
  return (
    <div id="text-editor-container" className={error ? "border-bottom-0" : ""}>
      <LabelText label={label} required={required} />
      <Editor
        readOnly={readOnly}
        placeholder={placeholder}
        editorState={editorState}
        wrapperClassName="demo-wrapper"
        editorClassName="demo-editor"
        onEditorStateChange={onChangeEditor}
        editorStyle={{ minHeight: height || "100px" }}
        stripPastedStyles={false}
        toolbar={{
          options: options,
          inline: {
            options: ["bold", "italic", "underline"],
          },
          list: { options: ["unordered", "ordered"] },
        }}
      />

      {error && (
        <div className="text-13-500 pt-1 w-100 border-top">
          <span style={{ color: "red" }}>{error}</span>
        </div>
      )}
    </div>
  );
};
export default TextEditor;
