import Button from "components/form/Button/Button";
import FileUpload from "components/form/FileUpload";
import RadioButton from "components/form/RadioButton";
import TextArea from "components/form/TextArea";
import TextInput from "components/form/TextInput/TextInput";
import { Formik } from "formik";
import { useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  addCategory,
  throwError,
  throwSuccess,
  updateCategory,
  uploadImage,
} from "store/globalSlice";
import * as Yup from "yup";

const AddCategoryFormModel = ({
  show,
  onHide,
  onSuccess,
  initialValues = null,
  isUpdate = false,
  userId,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formRef = useRef();
  const [btnLoading, setBtnLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const defaultValues = {
    name: "",
    cz_name: "",
    short_description: "",
    cz_short_description: "",
    long_description: "",
    cz_long_description: "",
    status: "active",
    image: "",
    position: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name (EN) is required"),
    cz_name: Yup.string().required("Name (CZ) is required"),

    position: Yup.string().matches(
      /^[1-9]\d*$/,
      "Position must be a positive number"
    ),

    short_description: Yup.string()
      .required("Short description (EN) is required")
      .test(
        "max-50-words",
        "Short description cannot exceed 50 words.",
        (value) => !value || value.trim().split(/\s+/).length <= 50
      ),

    long_description: Yup.string()
      .required("Long description (EN) is required")
      .test(
        "min-10-words",
        "Long description must be at least 10 words.",
        (value) => !value || value.trim().split(/\s+/).length >= 10
      )
      .test(
        "max-100-words",
        "Long description cannot exceed 100 words.",
        (value) => !value || value.trim().split(/\s+/).length <= 100
      ),

    cz_short_description: Yup.string()
      .required("Short description (CZ) is required")
      .test(
        "max-50-words",
        "Short description cannot exceed 50 words.",
        (value) => !value || value.trim().split(/\s+/).length <= 50
      ),

    cz_long_description: Yup.string()
      .required("Long description (CZ) is required")
      .test(
        "min-10-words",
        "Long description must be at least 10 words.",
        (value) => !value || value.trim().split(/\s+/).length >= 10
      )
      .test(
        "max-100-words",
        "Long description cannot exceed 100 words.",
        (value) => !value || value.trim().split(/\s+/).length <= 100
      ),
  });

  const handleSave = async (values) => {
    setBtnLoading(true);

    try {
      let imagePayload = uploadedImageUrl || values.image;

      if (values.image && values.image instanceof File) {
        const formData = new FormData();
        formData.append("image", values.image);
        const uploadRes = await dispatch(uploadImage(formData));

        if (uploadRes?.status === 200) {
          imagePayload = uploadRes.data.secure_url;
          setUploadedImageUrl(imagePayload);
        } else {
          dispatch(throwError(t("messages.imageUploadFailed")));
          setBtnLoading(false);
          return;
        }
      }
      const payload = {
        ...values,
        image: imagePayload,
      };

      let response;
      if (isUpdate && userId) {
        response = await dispatch(updateCategory({ id: userId, payload }));
        if (response?.status === 200)
          dispatch(throwSuccess(t("messages.categoryUpdatedSuccessfully")));
      } else {
        response = await dispatch(addCategory({ ...payload }));
        if (response?.status === 200)
          dispatch(throwSuccess(t("messages.categoryAddedSuccessfully")));
      }

      if (response?.status === 200) {
        onSuccess?.();
        onHide();
      } else {
        // Use backend message if available, otherwise use translation
        const errorMsg = response?.message || t("messages.somethingWentWrong");
        dispatch(throwError(errorMsg));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="text-24-700 color-black-100">
          {isUpdate ? t("category.updateTitle") : t("category.addTitle")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{ maxHeight: "70vh", overflowY: "auto", padding: "24px" }}
      >
        <Formik
          innerRef={formRef}
          enableReinitialize
          initialValues={initialValues || defaultValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          onSubmit={handleSave}
        >
          {(props) => {
            const { values, errors, handleChange, submitForm, setFieldValue } =
              props;
            const { status, position } = values;

            return (
              <form
                onSubmit={submitForm}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              >
                <div className="row mb-3">
                  <div className="col-md-6">
                    <TextInput
                      label={
                        <>
                          {t("category.nameEn")}{" "}
                          <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      placeholder={t("category.nameEnPlaceholder")}
                      id="name"
                      value={values.name}
                      error={errors.name}
                      onChange={handleChange}
                      className="mb-0"
                    />
                  </div>
                  <div className="col-md-6">
                    <TextInput
                      label={
                        <>
                          {t("category.nameCz")}{" "}
                          <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      placeholder={t("category.nameCzPlaceholder")}
                      id="cz_name"
                      value={values.cz_name}
                      error={errors.cz_name}
                      onChange={handleChange}
                      className="mb-0"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <TextInput
                      label={t("category.position")}
                      type="number"
                      placeholder={t("category.positionPlaceholder")}
                      id="position"
                      value={position}
                      error={errors.position}
                      onChange={handleChange}
                      className="mb-0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label d-block mb-2 text-15-500 color-black-100">
                      {t("category.status")}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="d-flex align-items-center gap-4">
                      <RadioButton
                        id="active"
                        label={t("common.active")}
                        name="status"
                        value="active"
                        checked={status === "active"}
                        onChange={() => setFieldValue("status", "active")}
                        className="radio-labels"
                      />
                      <RadioButton
                        id="deactive"
                        label={t("common.deactive")}
                        name="status"
                        value="deactive"
                        checked={status === "deactive"}
                        onChange={() => setFieldValue("status", "deactive")}
                        className="radio-labels"
                      />
                    </div>
                    {errors.status && (
                      <div className="text-danger mt-1 small text-13-500">
                        {errors.status}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <TextArea
                      label={t("category.shortDescEn")}
                      placeholder={t("category.shortDescEnPlaceholder")}
                      id="short_description"
                      value={values.short_description}
                      error={errors.short_description}
                      onChange={handleChange}
                      className="mb-0"
                    />
                  </div>
                  <div className="col-md-6">
                    <TextArea
                      label={t("category.shortDescCz")}
                      placeholder={t("category.shortDescCzPlaceholder")}
                      id="cz_short_description"
                      value={values.cz_short_description}
                      error={errors.cz_short_description}
                      onChange={handleChange}
                      className="mb-0"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <TextArea
                      label={t("category.longDescEn")}
                      placeholder={t("category.longDescEnPlaceholder")}
                      id="long_description"
                      value={values.long_description}
                      error={errors.long_description}
                      onChange={handleChange}
                      className="mb-0"
                    />
                  </div>
                  <div className="col-md-6">
                    <TextArea
                      label={t("category.longDescCz")}
                      placeholder={t("category.longDescCzPlaceholder")}
                      id="cz_long_description"
                      value={values.cz_long_description}
                      error={errors.cz_long_description}
                      onChange={handleChange}
                      className="mb-0"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <FileUpload
                    label={t("category.image")}
                    id="image"
                    value={values.image}
                    error={errors.image}
                    onChange={(file) => setFieldValue("image", file)}
                    className="mb-0"
                    previewUrl={
                      typeof values.image === "string"
                        ? values.image
                        : uploadedImageUrl
                    }
                  />
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                  <Button
                    btnText={t("common.cancel")}
                    btnStyle="GO"
                    onClick={onHide}
                    disabled={btnLoading}
                    className=""
                  />
                  <Button
                    btnText={isUpdate ? t("common.update") : t("common.submit")}
                    btnStyle="PD"
                    onClick={() => submitForm()}
                    btnLoading={btnLoading}
                    className=""
                  />
                </div>
              </form>
            );
          }}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddCategoryFormModel;
