import "./ShowProfile.scss";
import VerificationSection from "./VerificationSection";
import { FiClock, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const Tabsection = ({ url, text, activeService }) => {
  const { t, i18n } = useTranslation();

  let displayText = "";
  if (text) {
    displayText = text
      .split(/\s/)
      .reduce((acc, word) => (acc += word[0]), "")
      .substring(0, 2)
      .toUpperCase();
  }

  const langIsCz = (i18n.language || "").toLowerCase().startsWith("cz");

  const lastBooking =
    activeService?.provider?.lastBookingAt &&
    new Date(activeService.provider.lastBookingAt).toLocaleString();
  const lastReview =
    activeService?.provider?.lastReviewAt &&
    new Date(activeService.provider.lastReviewAt).toLocaleString();

  return (
    <div className="">
      <div className="">
        <div className="">
          <h2 className="">{activeService?.provider?.name || t("showProfile.providerNamePlaceholder")}</h2>

          <p>
            <strong>{langIsCz ? "Cena" : "Price"}:</strong> CZK{activeService?.price ?? "-"}
          </p>

          <p>
            <strong>{langIsCz ? "Stav" : "Status"}:</strong> {activeService?.status || "N/A"}
          </p>

          <div className="d-flex align-items-center gap-2">
            <FiCheckCircle className="text-success" />
            <span className="">
              {langIsCz ? "3 roky zkušeností" : "3 years experience"}
            </span>
          </div>

          <div className="p-4">
            <VerificationSection />
          </div>

          {/* Activity & Reviews */}
          <div className="mt-3">
            <h2 className="mb-2">{t("showProfile.activityHeading")}</h2>

            <div className="card p-3 mb-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <FiClock />
                <strong>{t("showProfile.lastBookingLabel")}</strong>
              </div>
              <div>{lastBooking || t("showProfile.noBookings")}</div>
            </div>

            <div className="card p-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <FiMessageSquare />
                <strong>{t("showProfile.lastReviewLabel")}</strong>
              </div>
              <div>
                {lastReview || t("showProfile.noReviewsDetailed")}
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                {t("showProfile.realExperienceNote")}
              </div>
            </div>
          </div>

          <div className="map-container" style={{ marginTop: "20px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d331575.65480416996!2d14.442745258023741!3d49.51406653223527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b948fd7dd8243%3A0xf8661c75d3db586f!2sCzechia!5e0!3m2!1sen!2sin!4v1763470563495!5m2!1sen!2sin"
              width="600"
              height="450"
              style={{ border: 0, width: "100%", height: "400px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Provider Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tabsection;
