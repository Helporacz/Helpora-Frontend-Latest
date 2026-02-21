import Button from "components/form/Button/Button";
import { ErrorMessage, Field, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addDistrict,
  getAllCities,
  throwError,
  throwSuccess,
  updateDistrict,
  updateProvider,
  userRegister,
} from "store/globalSlice";
import * as Yup from "yup";
import Select from "react-select";

const getDefaultValues = () => ({});

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

const AddDistict = ({
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
  const [cityOption, setCityOption] = useState([]);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const res = await dispatch(getAllCities());

        if (res?.cities) {
          const formatted = res.cities.map((city) => ({
            value: city._id,
            label: city.nameEn,
          }));
          setCityOption(formatted);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCity();
  }, [dispatch]);

  const validationSchema = Yup.object({
    nameEn: Yup.string().required("English name is required"),
    city: Yup.string().required("City is required"),
  });

  const handleSave = async (values) => {
    setBtnLoading(true);
    try {
      const payload = { ...values };

      const response =
        isUpdate && userId
          ? await dispatch(updateDistrict({ id: userId, payload }))
          : await dispatch(addDistrict(payload));

      if (response?.status === 200) {
        const successMessage = isUpdate
          ? t("messages.updateDistrict")
          : t("messages.addDistrict");
        dispatch(throwSuccess(successMessage));
        onSuccess?.();
        onHide();
      } else {
        const errorMsg = response?.message || t("messages.emailAlreadyExists");
        dispatch(throwError(errorMsg));
      }
    } catch (error) {
      console.error("Error saving provider:", error);
      dispatch(throwError(t("messages.errorSavingProvider")));
    } finally {
      setBtnLoading(false);
    }
  };

  const normalizedInitialValues =
    isUpdate && initialValues
      ? {
          ...initialValues,
          city: initialValues.city?._id || initialValues.city,
        }
      : getDefaultValues();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isUpdate
            ? t("addDistrict.addHeading")
            : t("addDistrict.updateHeading")}
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
                  {t("addDistrict.cityName")}{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  options={cityOption}
                  value={
                    cityOption.find((opt) => opt.value === values.city) ||
                    null
                  }
                  onChange={(option) =>
                    setFieldValue("city", option ? option.value : "")
                  }
                  placeholder={t("addDistrict.cityNamePlaceHolder")}
                />

                {errors.city && (
                  <div className="text-danger text-13-500 mt-1">
                    {errors.city}
                  </div>
                )}
              </div>

              <FormField label={`${t("addDistrict.name")} (EN)`} required errorName="nameEn">
                <Field
                  type="text"
                  name="nameEn"
                  placeholder={t("addDistrict.namePlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <FormField label={`${t("addDistrict.name")} (CS)`} required errorName="nameEn">
                <Field
                  type="text"
                  name="nameCs"
                  placeholder={t("addDistrict.namePlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <div className="d-flex justify-content-end">
                <Button
                  btnText={
                    isUpdate
                      ? t("addDistrict.updateButton")
                      : t("addDistrict.addButton")
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

export default AddDistict;
