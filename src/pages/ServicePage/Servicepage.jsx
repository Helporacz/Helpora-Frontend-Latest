import SittersSection from "components/SittersSection/SittersSection";
import Extrapage from "pages/Extrapage/Extrapage";
import Categories from "pages/Homepage/Categories/Categories";
import HeroSection from "pages/Homepage/Headersection/HeroSection";
import Reviewbox from "pages/Reviewbox/Reviewbox";


const Homepage = () => {
  return (
    <>
      <HeroSection />
      {/* <ServiceProvide /> */}
      <div className="container">
        <Categories />
        <Extrapage />
        <Reviewbox />
        <SittersSection />
      </div>
    </>
  );
};

export default Homepage;
