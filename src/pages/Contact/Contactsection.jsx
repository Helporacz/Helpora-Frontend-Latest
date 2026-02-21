import React, { useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./Contact.scss";

import { FaHome, FaPhone, FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { saveFormContactPage } from "store/globalSlice";
import { useDispatch } from "react-redux";
import MessagePopup from "components/layouts/MessagePopup/MessagePopup";

const ContactSection = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [messagePopup, setMessagePopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });
  const initialValues = {
    name: "",
    email: "",
    subject: "",
    message: "",
  };

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().required(t("section13.validation.name")),
        email: Yup.string()
          .email(t("section13.validation.email1"))
          .required(t("section13.validation.email2")),
        subject: Yup.string().required(t("section13.validation.subject")),
        message: Yup.string().required(t("section13.validation.message")),
      }),
    [i18n.language]
  );

  const onSubmit = async (values, { resetForm }) => {
    try {
      const response = await dispatch(saveFormContactPage(values));
      if (response?.status === 200 || response?.success) {
        setMessagePopup({
          show: true,
          title: t("section13.messagePopup.success"),
          message: t("section13.messagePopup.successMessage"),
          type: "success",
        });
        resetForm();
      } else {
        setMessagePopup({
          show: true,
          title: t("section13.messagePopup.error"),
          message: t("section13.messagePopup.errorMessage"),
          type: "error",
        });
      }
    } catch (error) {
      setMessagePopup({
        show: true,
        title: t("section13.messagePopup.error"),
        message: t("section13.messagePopup.errorMessage"),
        type: "error",
      });
    }
  };

  return (
    <>
      <MessagePopup
        show={messagePopup.show}
        onHide={() => setMessagePopup({ ...messagePopup, show: false })}
        title={messagePopup.title}
        message={messagePopup.message}
        type={messagePopup.type}
      />
      <section className="contact-section py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <h1 style={{ color: "#2d3748", fontWeight: "900" }}>
                {t("section12.text1")}
              </h1>
              <h1 className="gradient-text" style={{ fontWeight: "600" }}>
                {t("section12.text2")}
              </h1>
              <div className="contact-form-col p-4">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="contact-form">
                      <FieldGroup
                        name="name"
                        label={t("section13.text2")}
                        placeholder={t("section13.text3")}
                      />

                      <FieldGroup
                        name="email"
                        label={t("section13.text5")}
                        placeholder={t("section13.text6")}
                        type="email"
                      />

                      <FieldGroup
                        name="subject"
                        label={t("section13.text8")}
                        placeholder={t("section13.text9")}
                      />

                      <FieldGroup
                        name="message"
                        label={t("section13.text11")}
                        placeholder={t("section13.text12")}
                        as="textarea"
                        rows="4"
                      />

                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : t("section12.text3")}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
            <div className="col-md-6">
              <img
                src="https://media.istockphoto.com/id/1388648617/photo/confident-caucasian-young-man-in-casual-denim-clothes-with-arms-crossed-looking-at-camera.jpg?s=612x612&w=0&k=20&c=YxctPklAOJMmy6Tolyvn45rJL3puk5RlKt39FO46ZeA="
                alt=""
                className="setimage"
              />
              <ContactDetail
                icon={<FaHome />}
                title={t("section13.text13")}
                text={t("section13.text14")}
              />
              <ContactDetail
                icon={<FaPhone />}
                title="+420 722 922 334"
                text={t("section13.text15")}
              />
              <ContactDetail
                icon={<FaEnvelope />}
                title="info@helpora.cz"
                text={t("section13.text16")}
              />
            </div>
          </div>
        </div>

        <div className="container mt-5">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d331575.65480416996!2d14.442745258023741!3d49.51406653223527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b948fd7dd8243%3A0xf8661c75d3db586f!2sCzechia!5e0!3m2!1sen!2sin!4v1763470563495!5m2!1sen!2sin"
            style={{ border: 0, width: "100%", height: "350px" }}
            allowFullScreen=""
            loading="lazy"
            title="Provider Location"
          ></iframe>
        </div>
      </section>
    </>
  );
};

const FieldGroup = ({
  label,
  name,
  placeholder,
  as = "input",
  type = "text",
  rows,
}) => (
  <div className="form-group mb-3">
    <label>{label}</label>
    <Field
      as={as}
      type={type}
      name={name}
      placeholder={placeholder}
      rows={rows}
      className="form-control"
    />
    <ErrorMessage name={name} component="div" className="text-danger" />
  </div>
);

const ContactDetail = ({ icon, title, text }) => (
  <div className="contact-detail d-flex align-items-start mb-4">
    <div className="icon">{icon}</div>
    <div className="detail-text" style={{ wordBreak: "break-all" }}>
      <h5>{title}</h5>
      <p>{text}</p>
    </div>
  </div>
);

export default ContactSection;
