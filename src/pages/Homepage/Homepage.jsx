import ServiceProvide from "components/Home/ServiceProvide";
import SittersSection from "components/SittersSection/SittersSection";
import Extrapage from "pages/Extrapage/Extrapage";
import Reviewbox from "pages/Reviewbox/Reviewbox";
import Categories from "./Categories/Categories";
import HeroSection from "./Headersection/HeroSection";
import ProviderAdd from "components/Home/ProviderAdd";
import TrustBadges from "components/Home/TrustBadges";
import TopProvidersCarousel from "components/ranking/TopProvidersCarousel";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getPublicRankedProviders } from "store/globalSlice";
import "./Homepage.performance.scss";

const Homepage = () => {
  const dispatch = useDispatch();
  const [rankedProviders, setRankedProviders] = useState([]);
  const [rankedProvidersLoading, setRankedProvidersLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRankedProviders = async () => {
      setRankedProvidersLoading(true);
      const response = await dispatch(getPublicRankedProviders({ limit: 12 }));

      if (!isMounted) return;
      if (response?.success && Array.isArray(response?.data)) {
        setRankedProviders(response.data);
      } else {
        setRankedProviders([]);
      }
      setRankedProvidersLoading(false);
    };

    fetchRankedProviders();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <>
      <HeroSection/>
      <section className="home-performance-section">
        <TopProvidersCarousel
          providers={rankedProviders}
          loading={rankedProvidersLoading}
        />
      </section>
      {/* <ServiceProvide /> */}
      <section className="home-performance-section">
        <ProviderAdd />
      </section>
      <section className="home-performance-section">
        <TrustBadges />
      </section>
      <section className="home-performance-section">
        <Categories />
      </section>
      <section className="home-performance-section">
        <Extrapage />
      </section>
      <section className="home-performance-section">
        <Reviewbox />
      </section>
      {/* <SittersSection /> */}
    </>
  );
};

export default Homepage;
