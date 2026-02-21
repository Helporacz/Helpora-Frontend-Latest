import { useEffect, useState } from "react";
import Label from "../LabelText";
import "./FileUpload.scss";

const FileUpload = ({
  error,
  onChange,
  id,
  fileText,
  disabled,
  label,
  required,
  labelClass,
  previewUrl, // 👈 add this prop for existing image preview
}) => {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);

  const handleOnChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file); 
      setFileName(file.name);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  useEffect(() => {
    if (previewUrl) setPreview(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    setFileName(fileText);
  }, [fileText]);

  return (
    <div id="file-upload-container">
      {label && (
        <Label label={label} required={required} className={labelClass} />
      )}
      <div
        className={`file-upload-data ${disabled ? " disabled-file-block" : ""}`}
      >
        <div className="file-upload-block">
          <span className="file-upload-input">
            <div className="choose_file">
              <span className="btn-block pointer">
                <span className="me-2">
                  <i className="bi bi-upload" />
                </span>
                <span>Upload</span>
              </span>
              <input
                id={id}
                name="Select File"
                type="file"
                onChange={handleOnChange}
                accept="image/png, image/jpeg, image/jpg"
                disabled={disabled}
              />
            </div>
          </span>
          <span className="file-upload-name">{fileName}</span>
        </div>
      </div>

      {preview && (
        <div className="file-upload-preview mt-2">
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
        </div>
      )}

      {error && (
        <div className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

