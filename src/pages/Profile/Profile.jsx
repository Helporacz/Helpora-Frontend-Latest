import Loader from "components/layouts/Loader/Loader";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getAdminProfile, getUserProfile, throwError } from "store/globalSlice";
import ProfileDetails from "./ProfileDetails";
import ChangePassword from "./ChangePassword";
import ImageCropModal from "components/form/ImageCropModal";
import "./Profile.css";

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [viewType, setViewType] = useState("details");
  const [fetchedData, setFetchedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  const [newProfileFile, setNewProfileFile] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [cropSrc, setCropSrc] = useState("");
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);
  const normalizeImageType = (type) =>
    type === "image/png" ? "image/png" : "image/jpeg";
  const getCroppedFileName = (file, fallback) => {
    const baseName = file?.name
      ? file.name.replace(/\.[^/.]+$/, "")
      : fallback;
    const ext = normalizeImageType(file?.type) === "image/png" ? "png" : "jpg";
    return `${baseName}-cropped.${ext}`;
  };

  const isEditing = "true";
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;

      if (userRole === "superAdmin") {
        response = await dispatch(getAdminProfile());
      } else {
        response = await dispatch(getUserProfile(userId));
      }

      setFetchedData(response?.data || {});
      setImgData(null);
      setNewProfileFile(null);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userId, userRole]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    return () => {
      if (imgData?.startsWith("blob:")) {
        URL.revokeObjectURL(imgData);
      }
    };
  }, [imgData]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Loader size="md" />
      </div>
    );
  }

  const { profileImage } = fetchedData;

  return (
    <div className="container fadeIn py-4">
      {/* IMAGE SECTION */}
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div
          className="profile-img-wrapper mb-3 text-center pointer"
          onClick={() => {
            if (viewType === "details" && !imageUploading) {
              document.getElementById("hiddenProfileFile").click();
            }
          }}
          style={{
            cursor:
              viewType === "details" && !imageUploading ? "pointer" : "default",
          }}
        >
          {imgData ? (
            <img src={imgData} alt="Preview" />
          ) : profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <div className="no-logo d-flex justify-content-center align-items-center bg-light">
              {t("profile.noImage")}
            </div>
          )}

          {viewType === "details" && isEditing && !imageUploading && (
            <div className="color-blue-crayola text-15-600 text-decoration-underline pointer mt-2">
              {t("profile.changeImage")}
            </div>
          )}
        </div>

        <input
          type="file"
          id="hiddenProfileFile"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const allowed = ["image/png", "image/jpg", "image/jpeg"];
            if (!allowed.includes(file.type)) {
              dispatch(throwError("Only PNG, JPG, JPEG allowed."));
              e.target.value = null;
              return;
            }

            setImageUploading(true);
            setPendingFile(file);

            const reader = new FileReader();
            reader.onload = () => {
              setCropSrc(reader.result);
              setIsCropOpen(true);
              setImageUploading(false);
            };
            reader.onerror = () => {
              setImageUploading(false);
              setPendingFile(null);
              dispatch(throwError("Failed to load image"));
            };

            reader.readAsDataURL(file);
          }}
        />

        <div className="p-3 d-flex gap-1">
          <div
            className={`text-center py-2 px-3 pointer 
            ${viewType === "details" ? "active-tab" : ""}`}
            onClick={() => setViewType("details")}
          >
            {t("profile.editProfile")}
          </div>

          <div
            className={`text-center py-2 px-3 pointer 
            ${viewType === "password" ? "active-tab" : ""}`}
            onClick={() => setViewType("password")}
          >
            {t("profile.changePassword")}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-center mt-4">
        <div className="col-lg-8 col-md-10 col-sm-12 p-3">
          {viewType === "details" ? (
            <ProfileDetails
              fetchedData={fetchedData}
              handleSuccess={fetchProfile}
              isSuperAdmin={userRole === "superAdmin"}
              newProfileFile={newProfileFile}
              imgData={imgData}
              isEditing={isEditing}
              resetImage={() => {
                setImgData(null);
                setNewProfileFile(null);
              }}
            />
          ) : (
            <ChangePassword />
          )}
        </div>
      </div>

      <ImageCropModal
        open={isCropOpen}
        imageSrc={cropSrc}
        aspect={1}
        cropShape="round"
        title={t("profile.cropTitle", "Crop profile photo")}
        confirmText={t("common.saveChanges", "Save")}
        cancelText={t("common.cancel", "Cancel")}
        fileType={normalizeImageType(pendingFile?.type)}
        fileName={getCroppedFileName(pendingFile, "profile")}
        allowOriginal
        onCancel={() => {
          setIsCropOpen(false);
          setCropSrc("");
          setPendingFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        onUseOriginal={() => {
          if (!pendingFile) return;
          if (imgData?.startsWith("blob:")) {
            URL.revokeObjectURL(imgData);
          }
          setNewProfileFile(pendingFile);
          setImgData(URL.createObjectURL(pendingFile));
          setIsCropOpen(false);
          setCropSrc("");
          setPendingFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        onSave={(croppedFile) => {
          if (imgData?.startsWith("blob:")) {
            URL.revokeObjectURL(imgData);
          }
          setNewProfileFile(croppedFile);
          setImgData(URL.createObjectURL(croppedFile));
          setIsCropOpen(false);
          setCropSrc("");
          setPendingFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
      />
    </div>
  );
};

export default Profile;
