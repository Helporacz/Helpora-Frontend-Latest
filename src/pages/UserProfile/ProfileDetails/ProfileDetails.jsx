import Button from "components/form/Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TextInput from "components/form/TextInput/TextInput";
import { Formik } from "formik";

const ProfileDetails = ({ fetchedData, handleSuccess, isSuperAdmin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    name,
    firstName,
    lastName,
    email,
    phoneNumber,
    role,
    _id: id,
  } = fetchedData || {};

  const initialValues = isSuperAdmin
    ? {
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        phoneNumber: phoneNumber || "",
        role: role || "",
        Id: id,
        oldEmail: email || "",
      }
    : {
        name: name || "",
        email: email || "",
        phoneNumber: phoneNumber || "",
        role: role || "",
        Id: id,
        oldEmail: email || "",
      };

  return (
    <div className="fadeIn">
      <div className="text-17-600 color-black cmb-20">{t("profileDetails.title")}</div>
      <Formik enableReinitialize initialValues={initialValues}>
        {(props) => {
          const { values, handleChange } = props;
          const { name, firstName, lastName, email, phoneNumber, role } = values;

          return (
            <form className="row">
              {isSuperAdmin ? (
                <>
                  <div className="col-md-6 cmb-30">
                    <TextInput
                      label={t("profileDetails.firstName")}
                      id="firstName"
                      value={firstName}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="col-md-6 cmb-30">
                    <TextInput
                      label={t("profileDetails.lastName")}
                      id="lastName"
                      value={lastName}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </>
              ) : (
                <div className="col-md-6 cmb-30">
                  <TextInput
                    label={t("profileDetails.name")}
                    id="name"
                    value={name}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              )}

              <div className="col-md-6 cmb-30">
                <TextInput
                  label={t("profileDetails.emailAddress")}
                  id="email"
                  value={email}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div className="col-md-6 cmb-30">
                <TextInput
                  label={t("profileDetails.phoneNumberOptional")}
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div className={`${isSuperAdmin ? "cmb-30" : "col-md-6 cmb-30"}`}>
                <TextInput
                  label={t("profileDetails.role")}
                  id="role"
                  value={role}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div>
                <Button
                  btnText={t("common.edit").toUpperCase()}
                  btnStyle="PD"
                  onClick={() => {
                    navigate(`/admins/${id}`);
                  }}
                />
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ProfileDetails;
