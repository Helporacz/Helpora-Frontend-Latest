import { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import Select from "react-select";
import Button from "components/form/Button/Button";
import RadioButton from "components/form/RadioButton";
import TextInput from "components/form/TextInput/TextInput";
import { Modal } from "react-bootstrap";
import ImageCropModal from "components/form/ImageCropModal";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import {
  addProviderService,
  getAllCategory,
  getServicesByCategory,
  throwError,
  throwSuccess,
  updateProviderService,
} from "store/globalSlice";
import { useTranslation } from "react-i18next";

const AddProviderServiceModal = ({
  show,
  onHide,
  onSuccess,
  initialValues = null,
  isUpdate = false,
  serviceId,
}) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";
  const formRef = useRef();
  const [btnLoading, setBtnLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [cropSrc, setCropSrc] = useState("");
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const imageInputRef = useRef(null);
  const normalizeImageType = (type) =>
    type === "image/png" ? "image/png" : "image/jpeg";
  const getCroppedFileName = (file, fallback) => {
    const baseName = file?.name
      ? file.name.replace(/\.[^/.]+$/, "")
      : fallback;
    const ext = normalizeImageType(file?.type) === "image/png" ? "png" : "jpg";
    return `${baseName}-cropped.${ext}`;
  };

  useEffect(() => {
    if (!show) return;
    const existingImage =
      initialValues?.image || initialValues?.service?.image || "";
    setImagePreview(existingImage || "");
  }, [show, initialValues]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await dispatch(getAllCategory());
        if (res?.data) {
          const formatted = res.data.map((cat) => ({
            value: cat._id,
            label: currentLang === "cz" && cat.cz_name ? cat.cz_name : cat.name,
          }));
          setCategoryOptions(formatted);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [dispatch, currentLang]);

  useEffect(() => {
    if (!selectedCategories?.value) return;

    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await dispatch(
          getServicesByCategory(selectedCategories.value)
        );
        const formattedServices = (res?.data || []).map((s) => ({
          value: s._id,
          label: currentLang === "cz" && s.cz_title ? s.cz_title : s.title,
        }));

        setServiceOptions(formattedServices);

        if (isUpdate && initialValues?.service?._id) {
          const selectedService = formattedServices.find(
            (s) => s.value === initialValues.service._id
          );
          if (selectedService) {
            formRef.current?.setFieldValue("service", selectedService);
          }
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [selectedCategories, currentLang]);

  useEffect(() => {
    if (isUpdate && initialValues?.service?.category?.length > 0) {
      const cat = initialValues.service.category[0];
      const selectedCatOption = {
        value: cat._id,
        label: currentLang === "cz" && cat.cz_name ? cat.cz_name : cat.name,
      };
      setSelectedCategories(selectedCatOption);
      formRef.current?.setFieldValue("category", selectedCatOption);
    }
  }, [isUpdate, initialValues]);

  const defaultValues = {
    price: "",
    priceFrom: "",
    priceTo: "",
    category: null,
    service: null,
    status: "active",
    priceType: "fixed",
    subCategories: [],
    description: "",
  };

  const validationSchema = Yup.object().shape({
    price: Yup.number()
      .typeError(t("providerServiceForm.validation.price1"))
      .when("priceType", {
        is: (val) => val !== "range",
        then: (schema) =>
          schema
            .required(t("providerServiceForm.validation.price2"))
            .positive(t("providerServiceForm.validation.price3"))
            .integer(t("providerServiceForm.validation.price4")),
        otherwise: (schema) => schema.notRequired(),
      }),
    priceFrom: Yup.number()
      .typeError(t("providerServiceForm.validation.price1"))
      .when("priceType", {
        is: "range",
        then: (schema) =>
          schema
            .required(t("providerServiceForm.validation.price2"))
            .positive(t("providerServiceForm.validation.price3")),
        otherwise: (schema) => schema.notRequired(),
      }),
    priceTo: Yup.number()
      .typeError(t("providerServiceForm.validation.price1"))
      .when("priceType", {
        is: "range",
        then: (schema) =>
          schema
            .required(t("providerServiceForm.validation.price2"))
            .positive(t("providerServiceForm.validation.price3")),
        otherwise: (schema) => schema.notRequired(),
      }),
    service: Yup.object().nullable().required(t("providerServiceForm.validation.service")),
    category: Yup.object().nullable().required(t("providerServiceForm.validation.category")),
    priceType: Yup.string()
      .oneOf(["fixed", "hourly", "range"], t("providerServiceForm.validation.priceType"))
      .required(t("providerServiceForm.validation.priceType")),
  });

  const handleSave = async (values) => {
    setBtnLoading(true);
    try {
      const formData = new FormData();
      if (values.priceType === "range") {
        formData.append("priceFrom", values.priceFrom || "");
        formData.append("priceTo", values.priceTo || "");
        formData.append("price", "");
      } else {
        formData.append("price", values.price);
        formData.append("priceFrom", "");
        formData.append("priceTo", "");
      }
      formData.append("status", values.status);

      if (values.description) {
        formData.append("description", values.description);
      }

      formData.append(
        "subCategories",
        JSON.stringify(values.subCategories || [])
      );

      if (values.category?.value) {
        formData.append("category", values.category.value);
      }

      if (values.service?.value) {
        formData.append("service", values.service.value);
      }

      if (values.priceType) {
        formData.append("priceType", values.priceType);
      }

      if (values.image) formData.append("image", values.image);

      let response;
      if (isUpdate && serviceId) {
        response = await dispatch(
          updateProviderService({ id: serviceId, data: formData })
        );
      } else {
        response = await dispatch(addProviderService(formData));
      }

      if (response?.status === 200 || response?.payload?.status === 200) {
        dispatch(
          throwSuccess(response?.message || "Service saved successfully")
        );
        onSuccess?.();
        onHide();
      } else {
        dispatch(throwError(response?.message || "Something went wrong"));
      }
    } catch (error) {
      console.error("Save service error:", error);
      dispatch(throwError("Failed to save service"));
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <Modal.Header
        closeButton
        style={{
          borderBottom: "1px solid #f0f0f0",
          padding: "24px 32px 16px",
          backgroundColor: "#f8fafc"
        }}
      >
        <Modal.Title style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#1e293b",
          margin: 0
        }}>
          {isUpdate
            ? t("providerServiceForm.heading2")
            : t("providerServiceForm.heading")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{
        padding: "24px 32px 32px",
        maxHeight: "70vh",
        overflowY: "auto"
      }}>
        <Formik
          innerRef={formRef}
          enableReinitialize
          initialValues={
            initialValues
              ? {
                ...initialValues,
                category: initialValues?.service?.category?.length
                  ? {
                    value: initialValues.service.category[0]._id,
                    label:
                      currentLang === "cz" &&
                        initialValues.service.category[0].cz_name
                        ? initialValues.service.category[0].cz_name
                        : initialValues.service.category[0].name,
                  }
                  : null,
                service: initialValues.service
                  ? {
                    value: initialValues.service._id,
                    label:
                      currentLang === "cz" && initialValues.service.cz_title
                        ? initialValues.service.cz_title
                        : initialValues.service.title,
                  }
                  : null,
                priceType: initialValues.priceType || "fixed",
                priceFrom: initialValues.priceFrom || "",
                priceTo: initialValues.priceTo || "",
                subCategories: Array.isArray(initialValues.subCategories)
                  ? initialValues.subCategories
                  : initialValues.subCategories
                    ? [initialValues.subCategories]
                    : initialValues.subServiceName
                      ? [initialValues.subServiceName]
                      : [],
              }
              : defaultValues
          }
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSave}
        >
          {({ values, errors, handleChange, setFieldValue, submitForm }) => (
            <form onSubmit={submitForm} style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}>
              {/* Card 1: Basic Information */}
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px"
                  }}>
                    <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>1</span>
                  </div>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: 0
                  }}>
                    {t("providerServiceForm.sections.basic.title", "Basic Information")}
                  </h3>
                </div>

                <div style={{
                  
                }}>
                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475569"
                    }}>
                      {t("providerServiceForm.category.title")}
                      <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                    </label>
                    <Select
                      options={categoryOptions}
                      value={values.category}
                      onChange={(option) => {
                        setFieldValue("category", option || []);
                        setSelectedCategories(option || []);
                        setFieldValue("service", null);
                      }}
                      placeholder={t("providerServiceForm.category.placeHolder")}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          padding: "4px 8px",
                          minHeight: "44px",
                          backgroundColor: "#ffffff",
                          "&:hover": {
                            borderColor: "#9ca3af"
                          }
                        })
                      }}
                    />
                    {errors.category && (
                      <div style={{
                        color: "#ef4444",
                        fontSize: "12px",
                        marginTop: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span>⚠️</span> {errors.category}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      marginTop: "16px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475569"
                    }}>
                      {t("providerServiceForm.service.title")}
                      <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                    </label>
                    <Select
                      options={serviceOptions}
                      value={values.service}
                      onChange={(option) => setFieldValue("service", option)}
                      placeholder={
                        loadingServices
                          ? t("common.loading", "Loading...")
                          : t("providerServiceForm.service.placeHolder")
                      }
                      isDisabled={!values.category}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          padding: "4px 8px",
                          minHeight: "44px",
                          backgroundColor: "#ffffff",
                          "&:hover": {
                            borderColor: "#9ca3af"
                          }
                        })
                      }}
                    />
                    {errors.service && (
                      <div style={{
                        color: "#ef4444",
                        fontSize: "12px",
                        marginTop: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span>⚠️</span> {errors.service}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Sub Categories */}
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#8b5cf6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px"
                  }}>
                    <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>2</span>
                  </div>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: 0
                  }}>
                    {t("providerServiceForm.sections.subCategories.title", "Sub categories (optional)")}
                  </h3>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#475569"
                  }}>
                    {t(
                      "providerServiceForm.sections.subCategories.helper",
                      "Add specific service variations or specialties"
                    )}
                  </label>

                  <div style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "16px"
                  }}>
                    <input
                      type="text"
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "#ffffff",
                        transition: "all 0.2s",
                        ":focus": {
                          borderColor: "#8b5cf6",
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)"
                        }
                      }}
                      placeholder={t(
                        "providerServiceForm.subCategories.placeHolder",
                        "e.g., Deep cleaning, Window cleaning, TV mounting"
                      )}
                      value={subCategoryInput}
                      onChange={(e) => setSubCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmed = subCategoryInput.trim();
                          if (
                            trimmed &&
                            !values.subCategories?.includes(trimmed)
                          ) {
                            setFieldValue("subCategories", [
                              ...(values.subCategories || []),
                              trimmed,
                            ]);
                            setSubCategoryInput("");
                          }
                        }
                      }}
                    />
                    <button
                      style={{
                        padding: "10px 24px",
                        borderRadius: "8px",
                        border: "1px solid #8b5cf6",
                        backgroundColor: "#8b5cf6",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        ":hover": {
                          backgroundColor: "#7c3aed",
                          borderColor: "#7c3aed"
                        }
                      }}
                      type="button"
                      onClick={() => {
                        const trimmed = subCategoryInput.trim();
                        if (
                          trimmed &&
                          !values.subCategories?.includes(trimmed)
                        ) {
                          setFieldValue("subCategories", [
                            ...(values.subCategories || []),
                            trimmed,
                          ]);
                          setSubCategoryInput("");
                        }
                      }}
                    >
                      {t("providerServiceForm.subCategories.addButton", "Add")}
                    </button>
                  </div>

                  {!!values.subCategories?.length && (
                    <div style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "16px"
                    }}>
                      <div style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#64748b",
                        marginBottom: "12px"
                      }}>
                        {t(
                          "providerServiceForm.sections.subCategories.addedLabel",
                          "Added sub categories"
                        )}{" "}
                        ({values.subCategories.length})
                      </div>
                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px"
                      }}>
                        {values.subCategories.map((item, index) => (
                          <div
                            key={`${item}-${index}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 12px",
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              fontSize: "13px",
                              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                            }}
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              style={{
                                background: "none",
                                border: "none",
                                color: "#94a3b8",
                                fontSize: "16px",
                                lineHeight: "1",
                                cursor: "pointer",
                                padding: "0",
                                width: "16px",
                                height: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                ":hover": {
                                  color: "#ef4444"
                                }
                              }}
                              onClick={() => {
                                const next = values.subCategories.filter(
                                  (_, i) => i !== index
                                );
                                setFieldValue("subCategories", next);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Description & Image */}
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px"
                  }}>
                    <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>3</span>
                  </div>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: 0
                  }}>
                    {t("providerServiceForm.sections.description.title", "Description & Media")}
                  </h3>
                </div>

                <div style={{
                  
                }}>
                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475569"
                    }}>
                      {t("providerServiceForm.description.title", "Description")}
                    </label>
                    <textarea
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        minHeight: "120px",
                        resize: "vertical",
                        outline: "none",
                        backgroundColor: "#ffffff",
                        transition: "all 0.2s",
                        ":focus": {
                          borderColor: "#10b981",
                          boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)"
                        }
                      }}
                      rows={4}
                      id="description"
                      value={values.description}
                      onChange={handleChange}
                      placeholder={t("providerServiceForm.description.placeHolder", "Describe what is included, duration, location, requirements, etc.")}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475569"
                    }}>
                      {t("providerServiceForm.image.title", "Service Image (Optional)")}
                    </label>
                    <div style={{
                      border: "2px dashed #d1d5db",
                      borderRadius: "8px",
                      padding: "24px",
                      textAlign: "center",
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s",
                      ":hover": {
                        borderColor: "#10b981",
                        backgroundColor: "#f0fdf4"
                      }
                    }}>
                      {imagePreview && (
                        <div style={{ marginBottom: "12px" }}>
                          <img
                            src={imagePreview}
                            alt="Service preview"
                            style={{
                              width: "100%",
                              height: "180px",
                              objectFit: "contain",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              backgroundColor: "#ffffff"
                            }}
                          />
                        </div>
                      )}
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      ref={imageInputRef}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] || null;
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = () => {
                          setPendingImageFile(file);
                          setCropSrc(reader.result);
                          setIsCropOpen(true);
                        };
                        reader.onerror = () => {
                          dispatch(throwError("Failed to load image"));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                      <div style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "12px"
                      }}>
                        {t("providerServiceForm.image.recommended", "Recommended: Square image, 500×500px")}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "4px"
                      }}>
                        {t("providerServiceForm.image.defaultNote", "If not uploaded, default service image will be used.")}
                      </div>
                    </div>
                  </div>
                  <ImageCropModal
                    open={isCropOpen}
                    imageSrc={cropSrc}
                    aspect="auto"
                    aspectOptions={[
                      { label: "Original", value: "auto" },
                      { label: "Square", value: 1 },
                      { label: "4:3", value: 4 / 3 },
                      { label: "3:4", value: 3 / 4 },
                      { label: "16:9", value: 16 / 9 },
                    ]}
                    cropShape="rect"
                    title={t("providerServiceForm.image.cropTitle", "Crop service image")}
                    confirmText={t("common.saveChanges", "Save")}
                    cancelText={t("common.cancel", "Cancel")}
                    fileType={normalizeImageType(pendingImageFile?.type)}
                    fileName={getCroppedFileName(pendingImageFile, "service")}
                    allowOriginal
                    onCancel={() => {
                      setIsCropOpen(false);
                      setCropSrc("");
                      setPendingImageFile(null);
                      if (imageInputRef.current) {
                        imageInputRef.current.value = "";
                      }
                    }}
                    onUseOriginal={() => {
                      if (!pendingImageFile) return;
                      if (imagePreview?.startsWith("blob:")) {
                        URL.revokeObjectURL(imagePreview);
                      }
                      const previewUrl = URL.createObjectURL(pendingImageFile);
                      setImagePreview(previewUrl);
                      setFieldValue("image", pendingImageFile);
                      setIsCropOpen(false);
                      setCropSrc("");
                      setPendingImageFile(null);
                      if (imageInputRef.current) {
                        imageInputRef.current.value = "";
                      }
                    }}
                    onSave={(croppedFile) => {
                      if (imagePreview?.startsWith("blob:")) {
                        URL.revokeObjectURL(imagePreview);
                      }
                      const previewUrl = URL.createObjectURL(croppedFile);
                      setImagePreview(previewUrl);
                      setFieldValue("image", croppedFile);
                      setIsCropOpen(false);
                      setCropSrc("");
                      setPendingImageFile(null);
                      if (imageInputRef.current) {
                        imageInputRef.current.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              {/* Card 4: Pricing & Status */}
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px"
                  }}>
                    <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>4</span>
                  </div>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: 0
                  }}>
                    {t("providerServiceForm.sections.pricing.title", "Pricing & Status")}
                  </h3>
                </div>

                <div style={{
                  
                }}>
                  {/* Status */}
                  <div style={{
                    border: "1px solid #f1f5f9",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#f8fafc"
                  }}>
                    <label style={{
                      display: "block",
                      marginBottom: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#334155"
                    }}>
                      {t("providerServiceForm.status.title", "Status")}
                      <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                    </label>
                    <div style={{
                      display: "flex",
                      
                      gap: "12px"
                    }}>
                      <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: values.status === "active" ? "#f0fdf4" : "white",
                        transition: "all 0.2s"
                      }}>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: values.status === "active" ? "#10b981" : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: values.status === "active" ? "#10b981" : "white"
                        }}>
                          {values.status === "active" && (
                            <div style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "white"
                            }} />
                          )}
                        </div>
                        <div>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#1e293b"
                          }}>{t("providerServiceForm.status.option1")}</div>
                          <div style={{
                            fontSize: "12px",
                            color: "#64748b"
                          }}>
                            {t(
                              "providerServiceForm.status.helpActive",
                              "Service will be visible to customers"
                            )}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={values.status === "active"}
                          onChange={() => setFieldValue("status", "active")}
                          style={{ display: "none" }}
                        />
                      </label>

                      <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: values.status === "deactive" ? "#fef2f2" : "white",
                        transition: "all 0.2s"
                      }}>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: values.status === "deactive" ? "#ef4444" : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: values.status === "deactive" ? "#ef4444" : "white"
                        }}>
                          {values.status === "deactive" && (
                            <div style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "white"
                            }} />
                          )}
                        </div>
                        <div>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#1e293b"
                          }}>{t("providerServiceForm.status.option2")}</div>
                          <div style={{
                            fontSize: "12px",
                            color: "#64748b"
                          }}>
                            {t(
                              "providerServiceForm.status.helpInactive",
                              "Service will be hidden from customers"
                            )}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="status"
                          value="deactive"
                          checked={values.status === "deactive"}
                          onChange={() => setFieldValue("status", "deactive")}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Price Type */}
                  <div style={{
                    border: "1px solid #f1f5f9",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#f8fafc"
                  }}>
                    <label style={{
                      display: "block",
                      marginBottom: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#334155"
                    }}>
                      {t("providerServiceForm.priceType.title", "Price Type")}
                      <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                    </label>
                    <div style={{
                      display: "flex",
                      
                      gap: "12px"
                    }}>
                      <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: values.priceType === "fixed" ? "#eff6ff" : "white",
                        transition: "all 0.2s"
                      }}>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: values.priceType === "fixed" ? "#3b82f6" : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: values.priceType === "fixed" ? "#3b82f6" : "white"
                        }}>
                          {values.priceType === "fixed" && (
                            <div style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "white"
                            }} />
                          )}
                        </div>
                        <div>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#1e293b"
                          }}>{t("providerServiceForm.priceType.fixed")}</div>
                          <div style={{
                            fontSize: "12px",
                            color: "#64748b"
                          }}>
                            {t(
                              "providerServiceForm.priceType.fixedHelp",
                              "One-time fixed price for the service"
                            )}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="priceType"
                          value="fixed"
                          checked={values.priceType === "fixed"}
                          onChange={() => {
                            setFieldValue("priceType", "fixed");
                            setFieldValue("priceFrom", "");
                            setFieldValue("priceTo", "");
                          }}
                          style={{ display: "none" }}
                        />
                      </label>

                      <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: values.priceType === "hourly" ? "#eff6ff" : "white",
                        transition: "all 0.2s"
                      }}>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: values.priceType === "hourly" ? "#3b82f6" : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: values.priceType === "hourly" ? "#3b82f6" : "white"
                        }}>
                          {values.priceType === "hourly" && (
                            <div style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "white"
                            }} />
                          )}
                        </div>
                        <div>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#1e293b"
                          }}>{t("providerServiceForm.priceType.hourly")}</div>
                          <div style={{
                            fontSize: "12px",
                            color: "#64748b"
                          }}>
                            {t(
                              "providerServiceForm.priceType.hourlyHelp",
                              "Price per hour of service"
                            )}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="priceType"
                          value="hourly"
                          checked={values.priceType === "hourly"}
                          onChange={() => {
                            setFieldValue("priceType", "hourly");
                            setFieldValue("priceFrom", "");
                            setFieldValue("priceTo", "");
                          }}
                          style={{ display: "none" }}
                        />
                      </label>

                      <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: values.priceType === "range" ? "#eff6ff" : "white",
                        transition: "all 0.2s"
                      }}>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: values.priceType === "range" ? "#3b82f6" : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: values.priceType === "range" ? "#3b82f6" : "white"
                        }}>
                          {values.priceType === "range" && (
                            <div style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "white"
                            }} />
                          )}
                        </div>
                        <div>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#1e293b"
                          }}>{t("providerServiceForm.priceType.range", "Range")}</div>
                          <div style={{
                            fontSize: "12px",
                            color: "#64748b"
                          }}>
                            {t(
                              "providerServiceForm.priceType.rangeHelp",
                              "Set a price range (from–to)"
                            )}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="priceType"
                          value="range"
                          checked={values.priceType === "range"}
                          onChange={() => {
                            setFieldValue("priceType", "range");
                            setFieldValue("price", "");
                          }}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Input */}
                <div style={{
                  marginTop: "24px",
                  maxWidth: values.priceType === "range" ? "100%" : "300px"
                }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#334155"
                  }}>
                    {t("providerServiceForm.price.title")}
                    <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                  </label>

                  {values.priceType === "range" ? (
                    <div style={{
                      
                    }}>
                      <div style={{ position: "relative" }}>
                        <TextInput
                          placeholder={t("providerServiceForm.priceRange.fromPlaceholder", "From")}
                          id="priceFrom"
                          value={values.priceFrom}
                          onChange={handleChange}
                          style={{ width: "100%", paddingLeft: "40px" }}
                        />
                        <div style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#64748b"
                        }}>
                          
                        </div>
                        {errors.priceFrom && (
                          <div style={{
                            color: "#ef4444",
                            fontSize: "12px",
                            marginTop: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span> </span> {errors.priceFrom}
                          </div>
                        )}
                      </div>

                      <div style={{ position: "relative" }}>
                        <TextInput
                          placeholder={t("providerServiceForm.priceRange.toPlaceholder", "To")}
                          id="priceTo"
                          value={values.priceTo}
                          onChange={handleChange}
                          style={{ width: "100%", paddingLeft: "40px" }}
                        />
                        <div style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#64748b"
                        }}>
                          
                        </div>
                        {errors.priceTo && (
                          <div style={{
                            color: "#ef4444",
                            fontSize: "12px",
                            marginTop: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span> </span> {errors.priceTo}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: "relative" }}>
                        <TextInput
                          placeholder={t("providerServiceForm.price.placeHolder")}
                          id="price"
                          value={values.price}
                          onChange={handleChange}
                          style={{ width: "100%", paddingLeft: "40px" }}
                        />
                        <div style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#64748b"
                        }}>
                          
                        </div>
                      </div>
                      {errors.price && (
                        <div style={{
                          color: "#ef4444",
                          fontSize: "12px",
                          marginTop: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <span> </span> {errors.price}
                        </div>
                      )}
                    </>
                  )}

                  <div style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "8px"
                  }}>
                    {values.priceType === "hourly"
                      ? t(
                          "providerServiceForm.priceHint.hourly",
                          "Enter price per hour (CZK)"
                        )
                      : values.priceType === "range"
                      ? t(
                          "providerServiceForm.priceHint.range",
                          "Enter a price range (CZK)"
                        )
                      : t(
                          "providerServiceForm.priceHint.fixed",
                          "Enter total price (CZK)"
                        )}
                  </div>
                </div>
              </div>

              {/* Submit Button Card */}
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{
                      fontSize: "14px",
                      color: "#64748b",
                      marginBottom: "4px"
                    }}>
                      {isUpdate
                        ? t(
                            "providerServiceForm.sections.submit.subtitleUpdate",
                            "Update your service"
                          )
                        : t(
                            "providerServiceForm.sections.submit.subtitleAdd",
                            "Ready to add new service?"
                          )}
                    </div>
                    <div style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1e293b"
                    }}>
                      {isUpdate
                        ? t(
                            "providerServiceForm.sections.submit.titleUpdate",
                            "Review and update"
                          )
                        : t(
                            "providerServiceForm.sections.submit.titleAdd",
                            "Review and publish"
                          )}
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    gap: "12px"
                  }}>
                    <button
                      type="button"
                      onClick={onHide}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "white",
                        color: "#64748b",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        ":hover": {
                          backgroundColor: "#f8fafc",
                          borderColor: "#9ca3af"
                        }
                      }}
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                    <Button
                      btnText={
                        isUpdate
                          ? t("providerServiceForm.heading2")
                          : t("providerServiceForm.heading")
                      }
                      btnStyle="PD"
                      onClick={() => submitForm()}
                      btnLoading={btnLoading}
                      style={{
                        minWidth: "140px",
                        padding: "10px 32px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        backgroundColor: "#3b82f6",
                        borderColor: "#3b82f6",
                        ":hover": {
                          backgroundColor: "#2563eb",
                          borderColor: "#2563eb"
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddProviderServiceModal;
