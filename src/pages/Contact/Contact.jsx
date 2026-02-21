import HeroBanner from "components/Contact/HeroBanner";
import Contactsection from "./Contactsection";
import { useTranslation } from "react-i18next";
const Contact = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <div className="contact-page">
        <HeroBanner
          title={t("section25.text1")}
          image={
            "https://plus.unsplash.com/premium_photo-1675842663249-a8b70103dbaa?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
        />
        <Contactsection />
      </div>
    </>
  );
};

export default Contact;
