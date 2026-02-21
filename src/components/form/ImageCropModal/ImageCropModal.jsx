import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { Modal } from "react-bootstrap";
import { getCroppedImageBlob } from "utils/imageCrop";
import "./ImageCropModal.scss";

const ImageCropModal = ({
  open,
  imageSrc,
  aspect = 1,
  aspectOptions = null,
  cropShape = "rect",
  title = "Crop image",
  confirmText = "Save",
  cancelText = "Cancel",
  fileType = "image/jpeg",
  fileName = "cropped.jpg",
  allowOriginal = false,
  onCancel,
  onSave,
  onUseOriginal,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasAspectOptions = Array.isArray(aspectOptions) && aspectOptions.length;
  const [aspectValue, setAspectValue] = useState(
    hasAspectOptions ? aspectOptions[0].value : aspect || 1
  );
  const [resolvedAspect, setResolvedAspect] = useState(aspect || 1);

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setIsSaving(false);
    }
  }, [open, imageSrc]);

  useEffect(() => {
    if (!imageSrc) return;

    if (aspectValue === "auto" || aspectValue === null) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width && img.height ? img.width / img.height : 1;
        setResolvedAspect(Number.isFinite(ratio) && ratio > 0 ? ratio : 1);
      };
      img.onerror = () => setResolvedAspect(1);
      img.src = imageSrc;
      return;
    }

    setResolvedAspect(aspectValue || 1);
  }, [aspectValue, imageSrc]);

  useEffect(() => {
    if (hasAspectOptions) {
      const stillValid = aspectOptions.some(
        (option) => option.value === aspectValue
      );
      if (!stillValid) {
        setAspectValue(aspectOptions[0].value);
      }
    } else {
      setAspectValue(aspect || 1);
    }
  }, [aspect, aspectOptions, aspectValue, hasAspectOptions]);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [aspectValue, imageSrc]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const normalizedType =
    fileType === "image/png" ? "image/png" : "image/jpeg";

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || isSaving) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        mimeType: normalizedType,
      });
      const croppedFile = new File([blob], fileName, { type: normalizedType });
      onSave?.(croppedFile);
    } catch (error) {
      console.error("Image crop failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      show={open}
      onHide={onCancel}
      centered
      size="lg"
      className="image-crop-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {imageSrc && (
          <>
            <div className="cropper-wrapper">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={resolvedAspect}
                cropShape={cropShape}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            {hasAspectOptions && (
              <div className="aspect-options">
                {aspectOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={
                      option.value === aspectValue ? "active" : undefined
                    }
                    onClick={() => setAspectValue(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            <div className="cropper-controls">
              <label htmlFor="crop-zoom">Zoom</label>
              <input
                id="crop-zoom"
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {allowOriginal && (
          <button
            type="button"
            className="btn btn-light"
            onClick={onUseOriginal}
            disabled={!imageSrc || isSaving}
          >
            Use original
          </button>
        )}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className="btn btn-success"
          onClick={handleSave}
          disabled={!imageSrc || isSaving}
        >
          {isSaving ? "Saving..." : confirmText}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageCropModal;
