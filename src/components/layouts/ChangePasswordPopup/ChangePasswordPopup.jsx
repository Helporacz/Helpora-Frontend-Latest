import React, { useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import PasswordInput from "components/form/PasswordInput";
import Button from "components/form/Button";
import {
  setIsSuccessPasswordPopup,
  throwError,
  updateAdminPassword,
} from "store/globalSlice";

const ChangePasswordPopup = ({ onHide, subAdminsData }) => {
  const { _id: id } = subAdminsData || {};
  const dispatch = useDispatch();
  const formRef = useRef();

  const [btnLoading, setBtnLoading] = useState(false);
  const handleChangePassword = async (values) => {
    setBtnLoading(true);
    const payload = values;
    const response = await dispatch(updateAdminPassword(payload));
    if (response?.status === 200) {
      dispatch(setIsSuccessPasswordPopup(true));
      onHide();
      if (formRef.current) {
        formRef.current.resetForm();
      }
    } else {
      throwError(response?.message);
    }
    setBtnLoading(false);
  };

  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    adminId: id,
  };
  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old Password is required."),
    newPassword: Yup.string()
      .required("New Password is required.")
      .matches(/^\S*$/, "Whitespace is not allowed."),
    confirmPassword: Yup.string()
      .required("Confirm Password is required.")
      .matches(/^\S*$/, "Whitespace is not allowed.")
      .oneOf([Yup.ref("newPassword"), null], "Password not matched."),
  });
  return (
    <Modal
      show
      onHide={onHide}
      //   dialogClassName="modal-90w"
      aria-labelledby="example-custom-modal-styling-title"
      centered
      className=""
    >
      <Modal.Body className="p-4">
        <div className="d-flex align-items-center justify-content-center w-100 flex-column cmb-40">
          <div className="text-20-700 color-dashboard-primary">
            Change Password
          </div>
          <div className="text-15-500 color-black-80">
            Kindly enter your current password and choose a new password
          </div>
        </div>

        <Formik
          innerRef={formRef}
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleChangePassword}
        >
          {(props) => {
            const { values, errors, handleChange, submitForm } = props;
            const { oldPassword, newPassword, confirmPassword } = values;
            return (
              <div>
                <div className="cmb-24">
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter current password"
                    id="oldPassword"
                    value={oldPassword}
                    error={errors.oldPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="cmb-24">
                  <PasswordInput
                    label="New Password"
                    placeholder="Enter new password"
                    id="newPassword"
                    value={newPassword}
                    error={errors.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="cmb-24">
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Enter confirm password"
                    id="confirmPassword"
                    value={confirmPassword}
                    error={errors.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Button
                    btnText="CHANGE PASSWORD"
                    btnStyle="PD"
                    onClick={submitForm}
                    btnLoading={btnLoading}
                  />
                </div>
              </div>
            );
          }}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordPopup;
