import React from "react";
import { FaShieldAlt, FaLock, FaIdCard } from "react-icons/fa"; // icons for shield, lock, id card
import "./VerificationSection.scss"; // style as needed
import { useTranslation } from "react-i18next";

const VerificationSection = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="verification-container">
      {/* Top Row with Logo and Verifications */}
      <div className="verification-toprow">
        <div className="verification-left">
          <div className="mojeid-logo">
            moje<i>D</i>
          </div>
          <div className="verification-items">
            <div className="verification-item">
              <FaShieldAlt className="icon-shield" />
              <span>{t("showProfile.verification.emailAndPhoneNumber")}</span>
            </div>
            <div className="verification-item">
              <FaShieldAlt className="icon-shield" />
              <span>{t("showProfile.verification.verifiedAddress")}</span>
            </div>
          </div>
        </div>

        <div className="verification-right">
          <FaShieldAlt className="icon-shield" />
          <span>{t("showProfile.verification.verifiedIdentity")}</span>
        </div>
      </div>

      <hr className="verification-divider" />

      {/* Document verification section */}
      <div className="document-verification">
        <FaIdCard className="icon-idcard" />
        <span>
          {t("showProfile.verification.documents")} <br />
          <small>
            {t("showProfile.verification.verificationDate")}
          </small>
        </span>
      </div>

      <hr className="verification-divider" />
    </div>
  );
};

export default VerificationSection;
