import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  getMyKyc,
  saveKycBasicDetails,
  startNewKyc,
  uploadImage,
  uploadKycDocuments,
} from "store/globalSlice";
import * as Yup from "yup";
import "./KYCProcess.scss";
import { useNavigate } from "react-router-dom";
import { getLocalizedPath } from "utils/localizedRoute";
import MessagePopup from "components/layouts/MessagePopup/MessagePopup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const KYCProcess = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providerVerified, setProviderVerified] = useState(false);
  const [step, setStep] = useState(1);
  
  const [docPreviews, setDocPreviews] = useState({
    identityProof: null,
    addressProof: null,
  });
  
  const [docFiles, setDocFiles] = useState({
    identityProof: null,
    addressProof: null,
  });

  const [docValidationErrors, setDocValidationErrors] = useState({
    identityProof: "",
    addressProof: "",
  });

  const [messagePopup, setMessagePopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  const [viewMode, setViewMode] = useState(false);

  const basicDetailsSchema = Yup.object().shape({
    dob: Yup.date()
      .required(t("kycProfile.step1.validation.dob"))
      .max(new Date(), "Date of birth cannot be in the future")
      .test("age", "You must be at least 18 years old", (value) => {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        return age > 18 || (age === 18 && monthDiff >= 0);
      }),
    phoneNumber: Yup.string()
      .required(t("kycProfile.step1.validation.phoneNumber"))
      .test("valid-phone", t("kycProfile.step1.validation.phoneNumber"), (value) => {
        if (!value) return false;
        const normalized = value.startsWith("+") ? value : `+${value}`;
        const parsed = parsePhoneNumberFromString(normalized);
        return parsed ? parsed.isValid() : false;
      }),
    address: Yup.string()
      .required(t("kycProfile.step1.validation.address"))
      .min(10, "Address must be at least 10 characters"),
  });

  const documentSchema = Yup.object().shape({
    identityProof: Yup.string().required("Identity proof is required"),
    addressProof: Yup.string().required("Address proof is required"),
  });

  const basicFormik = useFormik({
    initialValues: {
      dob: "",
      phoneNumber: "",
      address: "",
    },
    validationSchema: basicDetailsSchema,
    onSubmit: async (values) => {
      await handleSaveBasic(values);
    },
    enableReinitialize: true,
  });

  const docFormik = useFormik({
    initialValues: {
      identityProof: "",
      addressProof: "",
    },
    validationSchema: documentSchema,
    onSubmit: async (values) => {
      await handleSubmitDocuments(values);
    },
    enableReinitialize: true,
  });

  const loadKyc = useCallback(async () => {
    setLoading(true);
    const res = await dispatch(getMyKyc());
    if (res?.status === 200) {
      setKyc(res.kyc || null);
      setProviderVerified(res.providerVerified || false);
      
      const dobValue = res?.kyc?.personalDetails?.dob
        ? res.kyc.personalDetails.dob.split("T")[0]
        : "";
      const phoneValue = res?.kyc?.personalDetails?.phoneNumber || "";
      const addressValue = res?.kyc?.personalDetails?.address || "";
      
      basicFormik.setValues({
        dob: dobValue,
        phoneNumber: phoneValue,
        address: addressValue,
      });

      const identityUrl = res?.kyc?.documents?.identityProof || "";
      const addressUrl = res?.kyc?.documents?.addressProof || "";
      
      docFormik.setValues({
        identityProof: identityUrl,
        addressProof: addressUrl,
      });

      const currentIsResubmit = res?.kyc?.status === "resubmit";
      
      if (identityUrl) {
        setDocPreviews(prev => ({ ...prev, identityProof: identityUrl }));
        if (!currentIsResubmit) {
          setDocFiles(prev => ({ ...prev, identityProof: "existing" }));
        } else {
          setDocFiles(prev => ({ ...prev, identityProof: null }));
        }
      }
      if (addressUrl) {
        setDocPreviews(prev => ({ ...prev, addressProof: addressUrl }));
        if (!currentIsResubmit) {
          setDocFiles(prev => ({ ...prev, addressProof: "existing" }));
        } else {
          setDocFiles(prev => ({ ...prev, addressProof: null }));
        }
      }

      if (res?.kyc?.steps?.basicDetailsCompleted) {
        setStep(2);
      } else {
        setStep(1);
      }
    }
    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

  const isSubmitted = kyc?.status === "submitted";
  const isApproved = kyc?.status === "approved";
  const isRejected = kyc?.status === "rejected";
  const isResubmit = kyc?.status === "resubmit";
  const isViewOnly = (isSubmitted || isApproved) && viewMode && !isResubmit;
  
  const showCardView = (isSubmitted || isApproved) && !viewMode && !isResubmit;

  const handleStartNew = async () => {
    setSaving(true);
    const res = await dispatch(startNewKyc());
    if (res?.status === 200) {
      setKyc(res.kyc);
      basicFormik.resetForm();
      docFormik.resetForm();
      setDocPreviews({
        identityProof: null,
        addressProof: null,
      });
      setDocFiles({
        identityProof: null,
        addressProof: null,
      });
      setDocValidationErrors({
        identityProof: "",
        addressProof: "",
      });
    }
    setSaving(false);
  };

  const handleSaveBasic = async (values) => {
    if (isViewOnly) return;
    setSaving(true);
    const res = await dispatch(
      saveKycBasicDetails({
        dob: values.dob,
        phoneNumber: values.phoneNumber,
        address: values.address,
      })
    );
    if (res?.status === 200) {
      setKyc(res.kyc);
      setStep(2);
    }
    setSaving(false);
  };

  const validateFile = (file) => {
    const errors = [];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!validTypes.includes(file.type)) {
      errors.push('Please upload only JPG, JPEG, or PNG files');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      errors.push('File size should be less than 5MB');
    }
    
    return errors.length === 0 ? null : errors.join(', ');
  };

  const handleFileSelect = (fileKey, file) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setDocValidationErrors(prev => ({ ...prev, [fileKey]: validationError }));
      return;
    }
    setDocValidationErrors(prev => ({ ...prev, [fileKey]: "" }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocPreviews(prev => ({ ...prev, [fileKey]: e.target.result }));
    };
    reader.readAsDataURL(file);
    setDocFiles(prev => ({ ...prev, [fileKey]: file }));
    docFormik.setFieldValue(fileKey, "");
  };

  const handleRemoveDocument = (fileKey) => {
    setDocPreviews(prev => ({ ...prev, [fileKey]: null }));
    setDocFiles(prev => ({ ...prev, [fileKey]: null }));
    docFormik.setFieldValue(fileKey, "");
    setDocValidationErrors(prev => ({ ...prev, [fileKey]: "" }));
  };

  const uploadFileToServer = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const uploadRes = await dispatch(uploadImage(formData));
    
    if (uploadRes?.status === 200) {
      const url =
        uploadRes?.data?.secure_url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.data?.secure_url ||
        uploadRes?.data?.data?.url;
      return url;
    }
    return null;
  };

  const handleSubmitDocuments = async () => {
    if (isApproved || isSubmitted) return;

    const errors = {};
    let hasErrors = false;

    if (!docFiles.identityProof) {
      errors.identityProof = "Identity proof is required";
      hasErrors = true;
    } else if (docValidationErrors.identityProof) {
      hasErrors = true;
    }

    if (!docFiles.addressProof) {
      errors.addressProof = "Address proof is required";
      hasErrors = true;
    } else if (docValidationErrors.addressProof) {
      hasErrors = true;
    }

    if (hasErrors) {
      setDocValidationErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setSaving(true);

    try {
      let identityUrl = "";
      if (isResubmit) {
        if (!docFiles.identityProof || docFiles.identityProof === "existing") {
          setMessagePopup({
            show: true,
            title: "Validation Error",
            message: "Please upload a new identity proof document for resubmission.",
            type: "warning",
          });
          setSaving(false);
          return;
        }
        identityUrl = await uploadFileToServer(docFiles.identityProof);
        if (!identityUrl) {
          setMessagePopup({
            show: true,
            title: "Upload Failed",
            message: "Failed to upload identity proof. Please try again.",
            type: "error",
          });
          setSaving(false);
          return;
        }
      } else {
        if (docFiles.identityProof && docFiles.identityProof !== "existing") {
          identityUrl = await uploadFileToServer(docFiles.identityProof);
          if (!identityUrl) {
            setMessagePopup({
              show: true,
              title: "Upload Failed",
              message: "Failed to upload identity proof. Please try again.",
              type: "error",
            });
            setSaving(false);
            return;
          }
        } else if (docFiles.identityProof === "existing") {
          identityUrl = docFormik.values.identityProof;
        }
      }

      let addressUrl = "";
      if (isResubmit) {
        if (!docFiles.addressProof || docFiles.addressProof === "existing") {
          setMessagePopup({
            show: true,
            title: "Validation Error",
            message: "Please upload a new address proof document for resubmission.",
            type: "warning",
          });
          setSaving(false);
          return;
        }
        addressUrl = await uploadFileToServer(docFiles.addressProof);
        if (!addressUrl) {
          setMessagePopup({
            show: true,
            title: "Upload Failed",
            message: "Failed to upload address proof. Please try again.",
            type: "error",
          });
          setSaving(false);
          return;
        }
      } else {
        if (docFiles.addressProof && docFiles.addressProof !== "existing") {
          addressUrl = await uploadFileToServer(docFiles.addressProof);
          if (!addressUrl) {
            setMessagePopup({
              show: true,
              title: "Upload Failed",
              message: "Failed to upload address proof. Please try again.",
              type: "error",
            });
            setSaving(false);
            return;
          }
        } else if (docFiles.addressProof === "existing") {
          addressUrl = docFormik.values.addressProof;
        }
      }

      const res = await dispatch(
        uploadKycDocuments({
          identityProof: identityUrl,
          addressProof: addressUrl,
        })
      );
      
      if (res?.status === 200) {
        setKyc(res.kyc);
        setMessagePopup({
          show: true,
          title: t("kycProfile.popup.sTitle"),
          message: t("kycProfile.popup.success"),
          type: "success",
        });
        
        docFormik.setValues({
          identityProof: identityUrl,
          addressProof: addressUrl,
        });
      } else {
        setMessagePopup({
          show: true,
          title: t("kycProfile.popup.fTitle"),
          message: t("kycProfile.popup.failed"),
          type: "error",
        });
      }
    } catch (error) {
      setMessagePopup({
        show: true,
        title: "Error",
        message: "An error occurred. Please try again.",
        type: "error",
      });
      console.error('Error submitting documents:', error);
    }
    
    setSaving(false);
  };

  const DocumentPreview = ({ preview, fileKey, title, onRemove }) => {
    if (!preview) return null;

    return (
      <div className="document-preview mb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>{title}</strong>
          {(!isViewOnly || isResubmit) && !isRejected && (
            <button
              onClick={() => onRemove(fileKey)}
              className="px-3 py-1 rounded" style={{backgroundColor:"yellow", border:"none"}}
            >
              Change
            </button>
          )}
        </div>
        <div 
          className="preview-container"
          style={{
            width: '100%',
            height: '210px',
            overflow: 'hidden',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <img 
            src={preview} 
            alt="Document preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#f8f9fa',
            }}
          />
        </div>
      </div>
    );
  };

  const invalidPhone =
    basicFormik.touched.phoneNumber && Boolean(basicFormik.errors.phoneNumber);

  if (loading) {
    return (
      <div className="container kyc-container mt-4 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container kyc-container mt-4">
      <MessagePopup
        show={messagePopup.show}
        onHide={() => setMessagePopup({ ...messagePopup, show: false })}
        title={messagePopup.title}
        message={messagePopup.message}
        type={messagePopup.type}
      />

      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <h3 className="m-0">{t("kycProfile.header")}</h3>
      </div>

      {(isSubmitted && !viewMode) && (
        <Alert variant="info">Your KYC is under review</Alert>
      )}

      {(isResubmit || isRejected) && kyc?.adminReviewNotes && (
        <Alert variant="warning">
          <strong>Admin Note:</strong> {kyc.adminReviewNotes}
        </Alert>
      )}

      {isRejected && (
        <Alert variant="danger">
          Your KYC was rejected. Please create a new KYC to continue.
        </Alert>
      )}

      {isApproved && !viewMode && (
        <Alert variant="success">
          Your KYC is Accepted. Please add your services.
          <span onClick={()=>navigate(getLocalizedPath('my-services', i18n.language))} className="text-decoration-underline" style={{color:"blue", cursor:"pointer"}} >Click here</span>
        </Alert>
      )}

      {showCardView && kyc && (
        <Card className="mb-4" style={{ border: "1px solid #e9ecef", borderRadius: "12px" }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">{t("kycProfile.detail.header")}</h5>
              <span
                className={`badge ${
                  kyc.status === "approved"
                    ? "bg-success"
                    : "bg-info"
                }`}
                style={{ fontSize: "0.9rem", padding: "6px 12px" }}
              >
                {kyc.status?.toUpperCase()}
              </span>
            </div>
            
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>{t("kycProfile.detail.name")}:</strong> {kyc.personalDetails?.fullName || "-"}
                </div>
                <div className="mb-2">
                  <strong>{t("kycProfile.detail.email")}:</strong> {kyc.personalDetails?.email || "-"}
                </div>
                <div className="mb-2">
                  <strong>{t("kycProfile.detail.phoneNumber")}:</strong> {kyc.personalDetails?.phoneNumber || "-"}
                </div>
                <div className="mb-2">
                  <strong>{t("kycProfile.detail.dob")}:</strong>{" "}
                  {kyc.personalDetails?.dob
                    ? new Date(kyc.personalDetails.dob).toLocaleDateString()
                    : "-"}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>{t("kycProfile.detail.address")}:</strong> {kyc.personalDetails?.address || "-"}
                </div>
                <div className="mb-2">
                  <strong>{t("kycProfile.detail.submitted")}:</strong>{" "}
                  {kyc.submittedAt
                    ? new Date(kyc.submittedAt).toLocaleDateString()
                    : "Not submitted"}
                </div>
              </Col>
            </Row>

            {kyc.documents?.identityProof && (
              <div className="mt-3 d-flex gap-2">
                <div style={{fontSize:"22px"}}>{t("kycProfile.detail.identityProof")}:</div>{" "}
                <a href={kyc.documents.identityProof} target="_blank" rel="noreferrer">
                  {t("kycProfile.detail.viewDocument")}
                </a>
              </div>
            )}

            {kyc.documents?.addressProof && (
              <div className="mt-2 d-flex gap-2">
                <div style={{fontSize:"22px"}}>{t("kycProfile.detail.addressProof")}:</div>{" "}
                <a href={kyc.documents.addressProof} target="_blank" rel="noreferrer">
                  {t("kycProfile.detail.viewDocument")}
                </a>
              </div>
            )}

            {/* <div className="mt-3">
              <button
                onClick={() => setViewMode(true)}
                className="px-4 py-2"
                style={{
                  border: "none",
                  backgroundColor: "#0d6efd",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                View Full Details
              </button>
            </div> */}
          </Card.Body>
        </Card>
      )}

      {!kyc && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div>{t("kycProfile.headingText")}</div>
              <div>{t("kycProfile.headingSubText")}</div>
            </div>
            <button 
              onClick={handleStartNew} 
              disabled={saving}
              className="px-3 py-2 rounded" style={{border:"1px solid #efefef"}}
            >
              {saving ? "Starting..." : t("kycProfile.startButton")}
            </button>
          </div>
        </div>
      )}

      {kyc && (viewMode || !showCardView) && (
        <>
          {viewMode && (isSubmitted || isApproved) && (
            <div className="mb-3">
              <button
                onClick={() => setViewMode(false)}
                className="px-3 py-2"
                style={{
                  border: "none",
                  backgroundColor: "#6c757d",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ← Back to Card View
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="mb-4 p-4" style={{backgroundColor:"white", border:"1px solid #e9ecef", borderRadius:"15px"}}>
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div><h3>{t("kycProfile.step1.heading")}</h3></div>
                  </div>
                </div>

                <Form onSubmit={basicFormik.handleSubmit}>
                  <div className="mb-3">
                    <Row className="g-3">
                      {/* DOB */}
                      <Col xs={12} md={4}>
                        <Form.Group className="mb-0">
                          <Form.Label>{t("kycProfile.detail.dob")} <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="date"
                            name="dob"
                            value={basicFormik.values.dob}
                            onChange={basicFormik.handleChange}
                            onBlur={basicFormik.handleBlur}
                            disabled={(isViewOnly && !isResubmit) || isRejected}
                            isInvalid={basicFormik.touched.dob && !!basicFormik.errors.dob}
                          />
                          <Form.Control.Feedback type="invalid">
                            {basicFormik.errors.dob}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      {/* Phone */}
                      <Col xs={12} md={4}>
                        <Form.Group className="mb-0" controlId="phoneNumber">
                          <Form.Label>
                            {t("kycProfile.detail.phoneNumber")} <span className="text-danger">*</span>
                          </Form.Label>

                          <div style={{ width: "100%", display: "block" }}>
                            <PhoneInput
                              country="cz"
                              value={basicFormik.values.phoneNumber}
                              onChange={(value) => {
                                const withPlus = value.startsWith("+") ? value : `+${value}`;
                                basicFormik.setFieldValue("phoneNumber", withPlus);
                              }}
                              onBlur={() => basicFormik.setFieldTouched("phoneNumber", true)}
                              inputProps={{
                                name: "phoneNumber",
                                required: true,
                                disabled: (isViewOnly && !isResubmit) || isRejected,
                              }}

                              /* 🔥 Force 100% width everywhere */
                              containerStyle={{
                                width: "100%",
                                display: "block"
                              }}

                              /* internal wrapper of react-phone-input-2 */
                              containerClass=""  // keep empty to avoid library overriding

                              inputStyle={{
                                width: "100%",
                                height: "calc(1.5em + .75rem + 2px)",
                                borderRadius: "0.375rem",
                                borderColor: invalidPhone ? "#dc3545" : "#ced4da",
                                paddingLeft: "48px", // space for flag
                                boxSizing: "border-box"
                              }}

                              buttonStyle={{
                                height: "calc(1.5em + .75rem + 2px)",
                                borderColor: invalidPhone ? "#dc3545" : "#ced4da",
                                borderRadius: "0.375rem 0 0 0.375rem",
                                backgroundColor: "#fff"
                              }}
                            />
                          </div>

                          {invalidPhone && (
                            <div className="invalid-feedback d-block">{basicFormik.errors.phoneNumber}</div>
                          )}
                        </Form.Group>
                      </Col>

                      {/* Address */}
                      <Col xs={12} md={4}>
                        <Form.Group className="mb-0">
                          <Form.Label>{t("kycProfile.detail.address")} <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="address"
                            value={basicFormik.values.address}
                            onChange={basicFormik.handleChange}
                            onBlur={basicFormik.handleBlur}
                            disabled={(isViewOnly && !isResubmit) || isRejected}
                            isInvalid={basicFormik.touched.address && !!basicFormik.errors.address}
                          />
                          <Form.Control.Feedback type="invalid">
                            {basicFormik.errors.address}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      disabled={(isViewOnly && !isResubmit) || isRejected || saving || !basicFormik.isValid}
                      className="px-4 py-2"
                      style={{border:"none" , backgroundColor:"#0d6efd", color:"white", borderRadius:"12px"}}
                    >
                      {saving ? "Saving..." : isResubmit ? t("kycProfile.step1.updatebutton") : t("kycProfile.step1.button")}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mb-4 p-4" style={{backgroundColor:"white", border:"1px solid #e9ecef", borderRadius:"15px"}}>
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="">{t("kycProfile.step2.heading")}</div>
                    <div className="text-muted">
                      {t("kycProfile.step2.detaial")}
                    </div>
                  </div>
                  <Badge bg={kyc.steps?.documentsUploaded ? "success" : "secondary"}>
                    {kyc.steps?.documentsUploaded ? "Uploaded" : "Pending"}
                  </Badge>
                </div>

                <Form onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitDocuments();
                }}>
                  <div className="mb-4">
                    <div>
                      <Form.Group>
                        <Form.Label>{t("kycProfile.detail.identityProof")} *</Form.Label>
                        
                        {docPreviews.identityProof && (!isResubmit || docFiles.identityProof === "existing") && (
                          <DocumentPreview
                            preview={docPreviews.identityProof}
                            fileKey="identityProof"
                            title="Identity Proof"
                            onRemove={handleRemoveDocument}
                          />
                        )}
                        
                        {(!docPreviews.identityProof || (isResubmit && docFiles.identityProof !== "existing")) && !isViewOnly && (
                          <>
                            <Form.Control
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => handleFileSelect("identityProof", e.target.files[0])}
                              disabled={isRejected}
                              isInvalid={!!docValidationErrors.identityProof || (!docFiles.identityProof && docFormik.submitCount > 0)}
                            />
                            <Form.Control.Feedback type="invalid">
                              {docValidationErrors.identityProof || (!docFiles.identityProof && docFormik.submitCount > 0 ? "Identity proof is required" : "")}
                            </Form.Control.Feedback>
                          </>
                        )}
                        
                        <Form.Text className="text-muted">
                          {t("kycProfile.step2.identity")}
                        </Form.Text>
                      </Form.Group>
                    </div>

                    <div className="mt-2">
                      <Form.Group>
                        <Form.Label>{t("kycProfile.detail.addressProof")} *</Form.Label>
                        
                        {docPreviews.addressProof && (!isResubmit || docFiles.addressProof === "existing") && (
                          <DocumentPreview
                            preview={docPreviews.addressProof}
                            fileKey="addressProof"
                            title="Address Proof"
                            onRemove={handleRemoveDocument}
                          />
                        )}
                        
                        {(!docPreviews.addressProof || (isResubmit && docFiles.addressProof !== "existing")) && !isViewOnly && (
                          <>
                            <Form.Control
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => handleFileSelect("addressProof", e.target.files[0])}
                              disabled={isRejected}
                              isInvalid={!!docValidationErrors.addressProof || (!docFiles.addressProof && docFormik.submitCount > 0)}
                            />
                            <Form.Control.Feedback type="invalid">
                              {docValidationErrors.addressProof || (!docFiles.addressProof && docFormik.submitCount > 0 ? "Address proof is required" : "")}
                            </Form.Control.Feedback>
                          </>
                        )}
                        
                        <Form.Text className="text-muted">
                          {t("kycProfile.step2.address")}
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between gap-2">
                    {!isViewOnly && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={(isSubmitted || isApproved) && !isResubmit}
                        className="px-4 py-2"
                        style={{border:"none" , backgroundColor:"#efefef", borderRadius:"12px"}}
                      >
                        {t("kycProfile.step2.backButton")}
                      </button>
                    )}
                    {!isViewOnly && (
                      <div className="d-flex gap-2">
                        {isRejected && (
                          <button
                            type="button"
                            onClick={handleStartNew}
                            disabled={saving}
                            className="px-4 py-2"
                            style={{border:"none" , backgroundColor:"#838282ff", color:"white", borderRadius:"12px"}}
                          >
                            {saving ? "Please wait..." : "Create New KYC"}
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={
                            (isApproved && !isResubmit) ||
                            (isSubmitted && !isResubmit) ||
                            isRejected ||
                            saving ||
                            isViewOnly
                          }
                          className="px-4 py-2"
                          style={{border:"none" , backgroundColor:"#0d6efd", color:"white", borderRadius:"12px"}}
                        >
                          {saving ? "Submitting..." : isResubmit ? t("kycProfile.step2.resubmitButton") : t("kycProfile.step2.submitButton")}
                        </button>
                      </div>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KYCProcess;
