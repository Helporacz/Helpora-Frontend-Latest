import Button from "components/form/Button/Button";
import { ErrorMessage, Field, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addCity,
  getAllRegions,
  throwError,
  throwSuccess,
  updateCity,
} from "store/globalSlice";
import * as Yup from "yup";
import Select from "react-select";

const getDefaultValues = () => ({
  nameEn: "",
  nameCs: "",
});

const FormField = ({ label, required = false, children, errorName }) => (
  <div>
    <label>
      {label} {required && <span style={{ color: "red" }}>*</span>}
    </label>
    <div className="input-wrapper">
      {children}
      {errorName && (
        <ErrorMessage
          name={errorName}
          component="div"
          className="invalid-feedback d-block"
        />
      )}
    </div>
  </div>
);

const AddCity = ({
  show,
  onHide,
  onSuccess,
  initialValues = null,
  isUpdate = false,
  userId,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const formRef = useRef();
  const [btnLoading, setBtnLoading] = useState(false);
  const [regionsOption, setRegionsOption] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await dispatch(getAllRegions());

        if (res?.regions) {
          const formatted = res.regions.map((regions) => ({
            value: regions._id,
            label: regions.nameEn,
          }));
          setRegionsOption(formatted);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchRegions();
  }, [dispatch]);

  const validationSchema = Yup.object({
    nameEn: Yup.string().required("English name is required"),
    region: Yup.string().required("Region is required"),
  });

  const handleSave = async (values) => {
    setBtnLoading(true);
    try {
      const payload = { ...values };

      const response =
        isUpdate && userId
          ? await dispatch(updateCity({ id: userId, payload }))
          : await dispatch(addCity(payload));

      if (response?.status === 200) {
        const successMessage = isUpdate
          ? t("messages.updateCity")
          : t("messages.addCity");
        dispatch(throwSuccess(successMessage));
        onSuccess?.();
        onHide();
      } else {
        const errorMsg = response?.message || t("messages.emailAlreadyExists");
        dispatch(throwError(errorMsg));
      }
    } catch (error) {
      console.error("Error saving city:", error);
      dispatch(throwError(t("messages.errorSavingProvider")));
    } finally {
      setBtnLoading(false);
    }
  };

  const normalizedInitialValues =
    isUpdate && initialValues
      ? {
          ...initialValues,
          region: initialValues.region?._id || initialValues.region,
        }
      : getDefaultValues();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isUpdate ? t("addCity.addHeading") : t("addCity.updateHeading")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          innerRef={formRef}
          initialValues={normalizedInitialValues}
          validationSchema={validationSchema}
          onSubmit={handleSave}
        >
          {({ submitForm, setFieldValue, values, errors }) => (
            <form
              onSubmit={submitForm}
              onKeyDown={(e) => e.key === "Enter" && submitForm(e)}
              className="d-flex flex-column gap-3"
            >

              <div className="mb-3">
                <label className="form-label d-block mb-2 text-15-500 color-black-100">
                  {t("addCity.regionName")}{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  options={regionsOption}
                  value={
                    regionsOption.find((opt) => opt.value === values.region) ||
                    null
                  }
                  onChange={(option) =>
                    setFieldValue("region", option ? option.value : "")
                  }
                  placeholder={t("addCity.regionNamePlaceHolder")}
                />

                {errors.region && (
                  <div className="text-danger text-13-500 mt-1">
                    {errors.region}
                  </div>
                )}
              </div>

              <FormField label={`${t("addCity.name")} (EN)`} required errorName="nameEn">
                <Field
                  type="text"
                  name="nameEn"
                  placeholder={t("addCity.namePlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <FormField label={`${t("addCity.name")} (CS)`} required errorName="nameCs">
                <Field
                  type="text"
                  name="nameCs"
                  placeholder={t("addCity.namePlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <div className="d-flex justify-content-end">
                <Button
                  btnText={
                    isUpdate
                      ? t("addCity.updateButton")
                      : t("addCity.addButton")
                  }
                  btnStyle="PD"
                  onClick={submitForm}
                  btnLoading={btnLoading}
                />
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddCity;
