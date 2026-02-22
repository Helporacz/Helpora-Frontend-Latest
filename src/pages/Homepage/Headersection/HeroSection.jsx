import { useState, useEffect, useRef, useMemo } from "react";
import { IoSparkles } from "react-icons/io5";
import "./HeroSection.scss";
import homePaintingImage from "../../../assets/images/Best-Home-Painting-Services-in-Bangalore.png";
import massageImage from "../../../assets/images/young-attractive-woman-having-massage-relaxing-spa-salon.jpg";
import tutorImage from "../../../assets/images/tutor-girl-home-writing-new-information.jpg";
import parlorImage from "../../../assets/images/hairdresser-styling-beautiful-woman.jpg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";
import { getAllCategoryName } from "store/globalSlice";
import { useDispatch } from "react-redux";
import regionsDataEn from "pages/Auth/Register/regions_en.json";
import regionsDataCz from "pages/Auth/Register/regions_cz.json";

const heroImages = [
  homePaintingImage,
  massageImage,
  tutorImage,
  parlorImage,
];

const HeroSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentSlide, setCurrentSlide] = useState(0);
  const { t, i18n } = useTranslation();
  const normalizedLang = (i18n.resolvedLanguage || i18n.language || "en")
    .toLowerCase()
    .split("-")[0];
  const currentLang = normalizedLang === "cs" ? "cz" : normalizedLang;
  const regionDataset = useMemo(
    () => (currentLang === "cz" ? regionsDataCz : regionsDataEn),
    [currentLang]
  );

  const cities = useMemo(() => {
    const regions = regionDataset?.regions || [];
    return regions.flatMap((region) =>
      (region.cities || []).map((city) => ({
        id: city.id,
        name: city.name,
        cityKey: city.id,
        regionName: region.name,
      }))
    );
  }, [regionDataset]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categoryOption, setCategoryOption] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState(() => new Set([0, 1]));
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const heroWrapperRef = useRef(null);


  useEffect(() => {
    const handleFocusOut = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsInputFocused(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener("focusin", handleFocusOut);
    return () => document.removeEventListener("focusin", handleFocusOut);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    handleMotionPreference();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionPreference);
      return () =>
        mediaQuery.removeEventListener("change", handleMotionPreference);
    }

    mediaQuery.addListener(handleMotionPreference);
    return () => mediaQuery.removeListener(handleMotionPreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsHeroVisible(true);
      return undefined;
    }

    if (!heroWrapperRef.current || !("IntersectionObserver" in window)) {
      setIsHeroVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(heroWrapperRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    setLoadedSlides((prev) => {
      const next = new Set(prev);
      next.add(currentSlide);
      next.add((currentSlide + 1) % heroImages.length);
      return next;
    });
  }, [currentSlide]);

  useEffect(() => {
    if (prefersReducedMotion || !isHeroVisible) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [isHeroVisible, prefersReducedMotion]);

  useEffect(() => {
    if (!selectedCategory || !searchText.trim() || !isInputFocused) {
      setFilteredCities([]);
      setShowDropdown(false);
      return;
    }

    const searchTerm = searchText.toLowerCase().trim();
    
    const filtered = cities.filter((item) => {
      if (!item) return false;

      const name = item.name?.toLowerCase() || "";
      const cityKey = item.cityKey?.toLowerCase() || "";
      const regionName = item.regionName?.toLowerCase() || "";

      return (
        name.includes(searchTerm) ||
        cityKey.includes(searchTerm) ||
        regionName.includes(searchTerm)
      );
    });

    setFilteredCities(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchText, selectedCategory, isInputFocused, cities]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await dispatch(getAllCategoryName());
        const categories = response?.data || [];
        setCategoryOption(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryOption([]);
      }
    };

    fetchCategories();
  }, [dispatch]);

  const handleCitySelect = (item) => {
    const cityName = item.name || item.cityKey || "";

    setSearchText(cityName);
    setSelectedCity(item || null);
    setShowDropdown(false);

    if (!selectedCategory) {
      console.error("No category selected!");
      alert("Please select a category first!");
      return;
    }

    navigate(
      getLocalizedPath(
        `/categories/${selectedCategory}/${selectedCategory}?city=${encodeURIComponent(
          cityName
        )}`,
        i18n.language
      )
    );
  };

  const handleSearchClick = () => {
    if (!selectedCategory) {
      alert("Please select a category first!");
      return;
    }

    const basePath = `/categories/${selectedCategory}/${selectedCategory}`;
    const trimmedSearch = searchText.trim();
    const normalizedSearch = trimmedSearch.toLowerCase();
    const matchedCity =
      selectedCity ||
      cities.find((city) => {
        const name = city?.name?.toLowerCase() || "";
        const key = city?.cityKey?.toLowerCase() || "";
        return name === normalizedSearch || key === normalizedSearch;
      });

    if (matchedCity?.name) {
      setSelectedCity(matchedCity);
      setSearchText(matchedCity.name);
      navigate(
        getLocalizedPath(
          `${basePath}?city=${encodeURIComponent(matchedCity.name)}`,
          i18n.language
        )
      );
      return;
    }

    if (trimmedSearch) {
      setSearchText("");
      setSelectedCity(null);
    }

    navigate(getLocalizedPath(basePath, i18n.language));
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (selectedCategory && searchText.trim() && filteredCities.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedCategory) {
      handleSearchClick();
    }
  };

  const getCityDisplayName = (city) => {
    if (!city) return "";
    return city.name || city.cityKey || "";
  };

  const getRegionDisplayName = (city) => {
    if (!city?.regionName) return "";
    return city.regionName;
  };

  return (
    <div
      ref={heroWrapperRef}
      className={`hero-wrapper ${isHeroVisible ? "is-visible" : "is-hidden"}`}
    >
      <div className="hero-backgrounds">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`hero-bg ${index === currentSlide ? "active" : ""} ${
              loadedSlides.has(index) ? "loaded" : "loading-placeholder"
            }`}
            style={
              loadedSlides.has(index)
                ? { backgroundImage: `url(${img})` }
                : undefined
            }
          />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="gradient-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="hero-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="hero-badge" data-aos="fade-down">
                <IoSparkles className="sparkle-icon" />
                <span>{t("homepage.miniTitle")}</span>
              </div>

              <h1
                className="hero-title"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                {t("homepage.title-1")}{" "}
                <span className="gradient-text">{t("homepage.title-2")} </span>
                <br />
                {t("homepage.title-3")}
              </h1>

              <p
                className="hero-subtitle"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {t("homepage.para-1")}
                <br />
                <span className="highlight-text">{t("homepage.title-4")} </span>
              </p>

              <div className="search-bar-wrapper">
                <select
                  className="category-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSearchText("");
                    setSelectedCity(null);
                    setFilteredCities([]);
                    setShowDropdown(false);
                  }}
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <option value="">
                    {t("homepage.selectCategory") || "Select Category"}
                  </option>
                  {categoryOption?.map((cat) => (
                    <option key={cat.id} value={cat._id || cat.id}>
                      {currentLang === "ru"
                        ? cat.ru_name || cat.name || cat.cz_name
                        : currentLang === "cz"
                        ? cat.cz_name || cat.name
                        : cat.name}
                    </option>
                  ))}
                </select>
                <div
                  className="search-input-wrapper"
                  ref={dropdownRef}
                  data-aos="fade-up"
                  data-aos-delay="350"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      selectedCategory
                        ? t("homepage.cityOptionalPlaceholder", "City (optional)")
                        : t("homepage.selectCategoryFirst") ||
                          "Select category first"
                    }
                    value={searchText}
                    disabled={!selectedCategory}
                    onFocus={handleInputFocus}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setSelectedCity(null);
                    }}
                    onKeyDown={handleKeyDown}
                    className={isInputFocused ? "focused" : ""}
                  />

                  {showDropdown && filteredCities.length > 0 && (
                    <ul className="city-dropdown" style={{ padding: "0px" }}>
                      {filteredCities.map((item, index) => (
                        <li
                          key={`${item._id || item.cityKey || index}-${index}`}
                          onClick={() => handleCitySelect(item)}
                          className="dropdown-item"
                        >
                          <span className="city-name">{getCityDisplayName(item)}</span>
                          {item.regionName && (
                            <span className="region">{getRegionDisplayName(item)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                    className="city-search-btn"
                  disabled={!selectedCategory}
                  onClick={handleSearchClick}
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  {t("homepage.search") || "Search"}
                </button>
              </div>

              <div className="mt-4 d-flex justify-content-center gap-3">
                <button
                  className="service-btn"
                  style={{ color: "white" }}
                  onClick={() =>
                    navigate(getLocalizedPath("/book-service", i18n.language))
                  }
                  data-aos="fade-up"
                  data-aos-delay="450"
                >
                  {t("homepage.btn-1")}
                </button>

                <button
                  className="service1-btn"
                  style={{ color: "white" }}
                  onClick={() =>
                    navigate(
                      getLocalizedPath("/become-provider", i18n.language)
                    )
                  }
                  data-aos="fade-up"
                  data-aos-delay="500"
                >
                  {t("homepage.btn-2")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="slide-indicators">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
