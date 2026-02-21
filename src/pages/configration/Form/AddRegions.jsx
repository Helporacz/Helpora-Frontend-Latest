import Button from "components/form/Button/Button";
import { ErrorMessage, Field, Formik } from "formik";
import { useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addRegion,
  throwError,
  throwSuccess,
  updateRegion,
} from "store/globalSlice";
import * as Yup from "yup";

const getDefaultValues = () => ({
  name: "",
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

const AddRegions = ({
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

  const handleSave = async (values) => {
    setBtnLoading(true);
    try {
      const payload = { ...values };
      if (!isUpdate) {
        payload.role = "provider";
      }

      const response =
        isUpdate && userId
          ? await dispatch(updateRegion({ id: userId, payload }))
          : await dispatch(addRegion(payload));

      if (response?.status === 200) {
        const successMessage = isUpdate
          ? t("messages.updateRegion")
          : t("messages.addRegion");
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

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isUpdate ? t("addRegion.updateHeading") : t("addRegion.addHeading")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          innerRef={formRef}
          initialValues={initialValues || getDefaultValues()}
          // validationSchema={createValidationSchema(isUpdate)}
          onSubmit={handleSave}
        >
          {({ submitForm }) => (
            <form
              onSubmit={submitForm}
              onKeyDown={(e) => e.key === "Enter" && submitForm(e)}
              className="d-flex flex-column gap-3"
            >

              <FormField label={`${t("addRegion.name")} (EN)`} required errorName="nameEn">
                <Field
                  type="text"
                  name="nameEn"
                  placeholder={t("addRegion.namePlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <FormField label={`${t("addRegion.name")} (CS)`} required errorName="nameCs">
                <Field
                  type="text"
                  name="nameCs"
                  placeholder={t("addRegion.namePlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <div className="d-flex justify-content-end">
                <Button
                  btnText={
                    isUpdate
                      ? t("addRegion.updateButton")
                      : t("addRegion.addButton")
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

export default AddRegions;
