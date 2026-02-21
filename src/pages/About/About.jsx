import StorySection from "components/AboutSection/StorySection";
import Aboutsection from "./Aboutsection";
import MissionValues from "components/AboutSection/MissionValues";
import CommunityImpact from "components/Service/CommunityImpact";
import FutureSection from "components/Service/FutureSection";
import HeroBanner from "components/Contact/HeroBanner";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="head">
        <HeroBanner
          title={t("section25.text2")}
          image={
            "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
        />
        <Aboutsection />
        <StorySection />
        <MissionValues />
        <CommunityImpact />
        <FutureSection />
      </div>
    </>
  );
};

export default About;
