import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Select from "react-select";
import { Formik } from "formik";
import * as Yup from "yup";

import Button from "components/form/Button/Button";
import FileUpload from "components/form/FileUpload";
import RadioButton from "components/form/RadioButton";
import TextArea from "components/form/TextArea";
import TextInput from "components/form/TextInput/TextInput";

import {
  addService,
  getAllCategory,
  throwError,
  throwSuccess,
  updateService,
  uploadImage,
} from "store/globalSlice";
import { useTranslation } from "react-i18next";

const AddServiceModalForm = ({
  show,
  onHide,
  onSuccess,
  initialValues = null,
  isUpdate = false,
  serviceId,
}) => {
  const dispatch = useDispatch();
  const formRef = useRef();
  const { t, i18n } = useTranslation();
  const [btnLoading, setBtnLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await dispatch(getAllCategory());
        if (res?.data) {
          const formatted = res.data
            .sort(
              (a, b) =>
                (a.sortPosition || Number.MAX_SAFE_INTEGER) -
                (b.sortPosition || Number.MAX_SAFE_INTEGER)
            )
            .map((cat) => ({ value: cat._id, label: cat.name }));
          setCategoryOptions(formatted);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [dispatch]);

  const defaultValues = {
    title: "",
    cz_title: "",
    description: "",
    cz_description: "",
    image: "",
    category: [],
    status: "active",
    position: "",
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .required("Title is required.")
      .max(100, "Title cannot exceed 100 characters."),
    cz_title: Yup.string()
      .required("Title is required.")
      .max(100, "Title cannot exceed 100 characters."),
    category: Yup.array().min(1, "At least one category is required."),
    description: Yup.string().required("Description (EN) is required"),
    cz_description: Yup.string().required("Description (CZ) is required"),
    position: Yup.string().matches(/^[1-9]\d*$/, "Position must be a number"),
  });

  const handleSave = async (values) => {
    setBtnLoading(true);
    try {
      let imagePayload = uploadedImageUrl || values.image;

      // Handle image upload
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
        category: values.category.map((c) => c.value),
        image: imagePayload,
      };

      let response;
      if (isUpdate && serviceId) {
        response = await dispatch(updateService({ id: serviceId, payload }));
        if (response?.status === 200)
          dispatch(throwSuccess(t("messages.serviceUpdatedSuccessfully")));
      } else {
        response = await dispatch(addService(payload));
        if (response?.status === 200)
          dispatch(throwSuccess(t("messages.serviceAddedSuccessfully")));
      }

      if (response?.status === 200) {
        onSuccess?.();
        onHide();
      } else {
        const errorMsg = response?.message || t("messages.somethingWentWrong");
        dispatch(throwError(errorMsg));
      }
    } catch (error) {
      console.error(error);
      dispatch(throwError(t("messages.somethingWentWrong")));
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title className="text-20-700 color-black-100">
          {isUpdate
            ? t("addServiceModel.updateHeading")
            : t("addServiceModel.addHeading")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{ maxHeight: "70vh", overflowY: "auto", padding: "24px" }}
      >
        <Formik
          innerRef={formRef}
          enableReinitialize
          initialValues={
            initialValues
              ? {
                  ...initialValues,
                  category:
                    initialValues.category?.map((c) => ({
                      value: c._id || c.value,
                      label: c.name || c.label,
                    })) || [],
                }
              : defaultValues
          }
          validationSchema={validationSchema}
          validateOnChange={false}
          onSubmit={handleSave}
        >
          {({ values, errors, handleChange, setFieldValue, submitForm }) => (
            <form
              onSubmit={submitForm}
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            >
              <div className="row mb-3">
                <div className="col-md-6">
                  <TextInput
                    label={
                      <>
                        {t("addServiceModel.form.header1")}
                        <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    id="title"
                    value={values.title}
                    error={errors.title}
                    onChange={handleChange}
                    className="mb-0"
                    placeholder={t("addServiceModel.form.TitlePlaceholder")}
                  />
                </div>
                <div className="col-md-6">
                  <TextInput
                    label={t("addServiceModel.form.header2")}
                    id="cz_title"
                    value={values.cz_title}
                    error={errors.cz_title}
                    onChange={handleChange}
                    className="mb-0"
                    placeholder={t("addServiceModel.form.TitlePlaceholder")}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <TextInput
                    label={t("addServiceModel.form.header3")}
                    placeholder={t("addServiceModel.form.PositionPlaceholder")}
                    id="position"
                    type="number"
                    value={values.position}
                    error={errors.position}
                    onChange={handleChange}
                    maxLength="100"
                    className="mb-0"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label d-block mb-2 text-15-500 color-black-100">
                    {t("addServiceModel.form.header4")}{" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="d-flex align-items-center gap-4">
                    <RadioButton
                      id="active"
                      label={t("addServiceModel.statusOption.active")}
                      name="status"
                      value="active"
                      checked={values.status === "active"}
                      onChange={() => setFieldValue("status", "active")}
                    />
                    <RadioButton
                      id="deactive"
                      label={t("addServiceModel.statusOption.deactive")}
                      name="status"
                      value="deactive"
                      checked={values.status === "deactive"}
                      onChange={() => setFieldValue("status", "deactive")}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block mb-2 text-15-500 color-black-100">
                  {t("addServiceModel.form.header8")}{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  isMulti
                  options={categoryOptions}
                  value={values.category}
                  onChange={(option) => setFieldValue("category", option)}
                  placeholder={t("addServiceModel.form.CategoryPlaceholder")}
                  className="mb-0"
                />
                {errors.category && (
                  <div className="text-danger text-13-500 mt-1">
                    {errors.category}
                  </div>
                )}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <TextArea
                    label={t("addServiceModel.form.header5")}
                    id="description"
                    value={values.description}
                    onChange={handleChange}
                    className="mb-0"
                    placeholder={t(
                      "addServiceModel.form.DescriptionPlaceholder"
                    )}
                    error={errors.description}
                  />
                </div>
                <div className="col-md-6">
                  <TextArea
                    label={t("addServiceModel.form.header6")}
                    id="cz_description"
                    value={values.cz_description}
                    error={errors.cz_description}
                    onChange={handleChange}
                    className="mb-0"
                    placeholder={t(
                      "addServiceModel.form.DescriptionPlaceholder"
                    )}
                  />
                </div>
              </div>

              <div className="mb-4">
                <FileUpload
                  label={t("addServiceModel.form.header7")}
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
                  onClick={submitForm}
                  btnLoading={btnLoading}
                  className=""
                />
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddServiceModalForm;
