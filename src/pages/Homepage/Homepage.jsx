import ServiceProvide from "components/Home/ServiceProvide";
import SittersSection from "components/SittersSection/SittersSection";
import Extrapage from "pages/Extrapage/Extrapage";
import Reviewbox from "pages/Reviewbox/Reviewbox";
import Categories from "./Categories/Categories";
import HeroSection from "./Headersection/HeroSection";
import ProviderAdd from "components/Home/ProviderAdd";
import TrustBadges from "components/Home/TrustBadges";
const Homepage = () => {
  
  return (
    <>
      <HeroSection/>
      {/* <ServiceProvide /> */}
      <ProviderAdd />
      <TrustBadges />
      <Categories />
      <Extrapage />
      <Reviewbox />
      {/* <SittersSection /> */}
    </>
  );
};

export default Homepage;
