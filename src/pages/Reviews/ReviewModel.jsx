import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import * as Yup from "yup";
import StarRatings from "react-star-ratings";

import Button from "components/form/Button/Button";
import FileUpload from "components/form/FileUpload";
import TextArea from "components/form/TextArea";
import TextInput from "components/form/TextInput/TextInput";

import {
  updateReview,
  uploadImage,
  throwError,
  throwSuccess,
  addReview,
  getAllServices,
} from "store/globalSlice";

const ReviewModel = ({
  show,
  onHide,
  onSuccess,
  initialValues,
  isUpdate = false,
  reviewId,
}) => {
  const dispatch = useDispatch();
  const formRef = useRef();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";

  const [btnLoading, setBtnLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await dispatch(getAllServices());
        const services = res?.serviceData || [];

        setServiceOptions(
          services.map((s) => ({
            value: s._id,
            label: currentLang === "cz" && s.cz_title ? s.cz_title : s.title,
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchServices();
  }, [dispatch, currentLang]);

  const defaultValues = {
    name: "",
    cz_name: "",
    comment: "",
    cz_comment: "",
    profileImage: "",
    service: null,
    position: "",
    rating: 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name (EN) is required"),
    cz_name: Yup.string().required("Name (CZ) is required"),
    comment: Yup.string().required("Revirw (EN) is required"),
    cz_comment: Yup.string().required("Review (CZ) is required"),
    service: Yup.object().required("Service is required"),
    rating: Yup.number()
      .min(0.5, "Minimum rating is 0.5")
      .max(5, "Maximum rating is 5")
      .required("Rating is required"),
    position: Yup.string().matches(/^[1-9]\d*$/, "Position must be a number"),
  });

  const handleSubmit = async (values) => {
    setBtnLoading(true);

    try {
      let imageUrl = uploadedImageUrl || values.image;

      if (values.image instanceof File) {
        const formData = new FormData();
        formData.append("image", values.image);

        const uploadRes = await dispatch(uploadImage(formData));
        if (uploadRes?.status !== 200) {
          dispatch(throwError(t("messages.imageUploadFailed")));
          return;
        }

        imageUrl = uploadRes.data.secure_url;
        setUploadedImageUrl(imageUrl);
      }

      const payload = {
        ...values,
        service: values.service.value,
        profileImage: imageUrl,
      };

      const response = isUpdate
        ? await dispatch(updateReview({ id: reviewId, payload }))
        : await dispatch(addReview(payload));

      if (response?.status === 200) {
        dispatch(
          throwSuccess(
            isUpdate
              ? t("messages.reviewUpdatedSuccessfully")
              : t("messages.reviewAddedSuccessfully")
          )
        );
        onSuccess?.();
        onHide();
      } else {
        dispatch(
          throwError(response?.message || t("messages.somethingWentWrong"))
        );
      }
    } catch (error) {
      console.error(error);
      dispatch(throwError(t("messages.somethingWentWrong")));
    } finally {
      setBtnLoading(false);
    }
  };

  const formInitialValues = initialValues
    ? {
        ...initialValues,
        image: initialValues.profileImage || "",
        service: initialValues.service
          ? {
              value: initialValues.service._id,
              label:
                currentLang === "cz" && initialValues.service.cz_title
                  ? initialValues.service.cz_title
                  : initialValues.service.title,
            }
          : null,
      }
    : defaultValues;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title className="text-20-700 color-black-100">
          {isUpdate
            ? t("addReviewModel.updateHeading")
            : t("addReviewModel.addHeading")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{ maxHeight: "70vh", overflowY: "auto", padding: "24px" }}
      >
        <Formik
          innerRef={formRef}
          enableReinitialize
          initialValues={formInitialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          onSubmit={handleSubmit}
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
                        {t("addReviewModel.form.header1")} (EN){" "}
                        <span style={{ color: "red" }}>*</span>
                      </>
                    }
                    id="name"
                    value={values.name}
                    error={errors.name}
                    onChange={handleChange}
                    className="mb-0"
                  />
                </div>
                <div className="col-md-6">
                  <TextInput
                    label={`${t("addReviewModel.form.header1")} (CZ)`}
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
                    label={t("addReviewModel.form.header2")}
                    id="position"
                    type="number"
                    error={errors.position}
                    value={values.position}
                    onChange={handleChange}
                    className="mb-0"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label d-block mb-2 text-15-500 color-black-100">
                    {t("addReviewModel.form.header6")}{" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <StarRatings
                    rating={Number(values.rating)}
                    changeRating={(r) => setFieldValue("rating", r)}
                    numberOfStars={5}
                    starRatedColor="#ffd700"
                    starDimension="24px"
                  />
                  {errors.rating && (
                    <div className="text-danger text-13-500 mt-1">
                      {errors.rating}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block mb-2 text-15-500 color-black-100">
                  {t("addReviewModel.form.header5")}{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  options={serviceOptions}
                  value={values.service}
                  onChange={(opt) => setFieldValue("service", opt)}
                  placeholder={
                    t("addReviewModel.form.ServicePlaceholder") ||
                    "Select Service"
                  }
                />
                {errors.service && (
                  <div className="text-danger text-13-500 mt-1">
                    {errors.service}
                  </div>
                )}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <TextArea
                    label={`${t("addReviewModel.form.header3")} (EN)`}
                    id="comment"
                    value={values.comment}
                    error={errors.comment}
                    onChange={handleChange}
                    className="mb-0"
                  />
                </div>
                <div className="col-md-6">
                  <TextArea
                    label={`${t("addReviewModel.form.header3")} (CZ)`}
                    id="cz_comment"
                    value={values.cz_comment}
                    error={errors.cz_comment}
                    onChange={handleChange}
                    className="mb-0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <FileUpload
                  label={t("addReviewModel.form.header4")}
                  id="image"
                  btnStyle={{ cursor: "pointer" }}
                  value={values.image}
                  onChange={(file) => setFieldValue("image", file)}
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
                  btnLoading={btnLoading}
                  onClick={submitForm}
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

export default ReviewModel;
