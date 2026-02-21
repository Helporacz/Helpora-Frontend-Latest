import HowItWorks from "components/Service/CommunityImpact";
import "./Service.scss";
import Servicesection from "./Servicesection";
import FutureSection from "components/Service/FutureSection";
import HeroSection from "pages/Homepage/Headersection/HeroSection";
import HeroBanner from "components/Contact/HeroBanner";
import { useTranslation } from "react-i18next";
const Service = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      {/* <HeroSection /> */}
      <HeroBanner
        title={t("section25.text3")}
        image={
          "https://images.pexels.com/photos/48889/cleaning-washing-cleanup-the-ilo-48889.jpeg"
        }
      />
      <Servicesection />
      <HowItWorks />
      <FutureSection />
    </div>
  );
};

export default Service;
