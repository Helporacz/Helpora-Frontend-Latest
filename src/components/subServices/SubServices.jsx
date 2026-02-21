import SkeletonSubService from "components/Skeleton/SkeletonSubService";
import { useCallback, useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import { FaRegCreditCard, FaUser, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  createBooking,
  getAllCategory,
  getAllCities,
  getAllDistricts,
  getProviderServicesByCategory,
  throwError,
  throwSuccess,
} from "store/globalSlice";
import { getDataFromLocalStorage } from "utils/helpers";
import clean from "../../assets/images/clean.jpg";
import BookingModal from "./BookingModel";
import "./Subservice.scss";
import { getLocalizedPath } from "utils/localizedRoute";
import { CiLocationOn } from "react-icons/ci";

const SubServices = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "cz" ? "cz" : "en";

  const cityDropdownRef = useRef(null);
  const districtDropdownRef = useRef(null);
  const cityInputRef = useRef(null);
  const districtInputRef = useRef(null);

  const { slug, id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get("city");
  const districtParam = searchParams.get("district");

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackLabel, setFallbackLabel] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  const [citySearchText, setCitySearchText] = useState(cityParam || "");
  const [districtSearchText, setDistrictSearchText] = useState(
    districtParam || ""
  );
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [isCityInputFocused, setIsCityInputFocused] = useState(false);
  const [isDistrictInputFocused, setIsDistrictInputFocused] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [note, setNote] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [revealedContacts, setRevealedContacts] = useState({});
  const [categories, setCategories] = useState([]);

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formattedCities, setFormattedCities] = useState([]);
  const [formattedDistricts, setFormattedDistricts] = useState([]);
  const [selectedCityData, setSelectedCityData] = useState(null);
  const [cityDropdownSearch, setCityDropdownSearch] = useState("");
  const [districtDropdownSearch, setDistrictDropdownSearch] = useState("");
  const navigate = useNavigate();
  const token = getDataFromLocalStorage("token");

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await dispatch(getAllCities());

        let citiesData = [];
        if (res?.data?.status === 200 && res.data.cities) {
          citiesData = res.data.cities;
        } else if (res?.cities) {
          citiesData = res.cities;
        } else if (res?.data?.cities) {
          citiesData = res.data.cities;
        }

        const formatted = citiesData.map((city) => ({
          id: city._id,
          city:
            currentLang === "cz"
              ? city.nameCs || city.nameEn
              : city.nameEn || city.nameCs,
          cityKey: city.cityKey,
          region: city.region?.nameEn || "Unknown Region",
          regionKey: city.region?.regionKey,
          originalData: city,
        }));

        setCities(citiesData);
        setFormattedCities(formatted);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
        setFormattedCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [dispatch, currentLang]);

  useEffect(() => {
    if (cityParam) {
      setIsSearchMode(true);
      setSearchCity(cityParam);
      setCitySearchText(cityParam);
    } else {
      setSearchCity("");
      setCitySearchText("");
    }

    if (districtParam) {
      setSearchDistrict(districtParam);
      setDistrictSearchText(districtParam);
    } else {
      setSearchDistrict("");
      setDistrictSearchText("");
    }
  }, [cityParam, districtParam]);

  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await dispatch(getAllDistricts());

        let districtsData = [];
        if (res?.data?.status === 200 && res.data.districts) {
          districtsData = res.data.districts;
        } else if (res?.districts) {
          districtsData = res.districts;
        } else if (res?.data?.districts) {
          districtsData = res.data.districts;
        }

        const formatted = districtsData.map((district) => ({
          id: district._id,
          district:
            currentLang === "cz"
              ? district.nameCs || district.nameEn
              : district.nameEn || district.nameCs,
          cityId: district.city?._id || district.city,
          originalData: district,
        }));

        setDistricts(districtsData);
        setFormattedDistricts(formatted);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setDistricts([]);
        setFormattedDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [dispatch, currentLang]);

  useEffect(() => {
    if (!showCityDropdown) {
      setFilteredCities([]);
      return;
    }

    const searchTerm = cityDropdownSearch.toLowerCase().trim();
    if (!searchTerm) {
      setFilteredCities(formattedCities);
      return;
    }

    const filtered = formattedCities.filter(
      (item) =>
        item.city.toLowerCase().includes(searchTerm) ||
        item.region.toLowerCase().includes(searchTerm)
    );

    setFilteredCities(filtered);
  }, [cityDropdownSearch, showCityDropdown, formattedCities]);

  useEffect(() => {
    if (!showDistrictDropdown) {
      setFilteredDistricts([]);
      return;
    }

    const searchTerm = districtDropdownSearch.toLowerCase().trim();
    let filtered = [];

    if (selectedCityData) {
      const cityDistricts = formattedDistricts.filter(
        (item) => item.cityId === selectedCityData.id
      );

      if (!searchTerm) {
        filtered = cityDistricts;
      } else {
        filtered = cityDistricts.filter((item) =>
          item.district.toLowerCase().includes(searchTerm)
        );
      }
    } else {
      if (!searchTerm) {
        filtered = formattedDistricts;
      } else {
        filtered = formattedDistricts.filter((item) =>
          item.district.toLowerCase().includes(searchTerm)
        );
      }
    }

    setFilteredDistricts(filtered);
  }, [
    districtDropdownSearch,
    showDistrictDropdown,
    formattedDistricts,
    selectedCityData,
  ]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setIsFallback(false);
    setFallbackLabel("");

    const normalizeResults = (response) => {
      if (response?.data?.success) {
        return response.data.data || [];
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response?.data?.data)) {
        return response.data.data;
      }
      return [];
    };

    try {
      const params = { id };

      if (searchCity) {
        params.city = searchCity.trim();
      }

      if (searchDistrict) {
        params.district = searchDistrict.trim();
      }

      const response = await dispatch(getProviderServicesByCategory(params));
      const initialResults = normalizeResults(response);

      if (initialResults.length > 0) {
        setServices(initialResults);
        return;
      }

      if (searchCity || searchDistrict) {
        const fallbackResponse = await dispatch(
          getProviderServicesByCategory({ id })
        );
        const fallbackResults = normalizeResults(fallbackResponse);

        if (fallbackResults.length > 0) {
          setServices(fallbackResults);
          setIsFallback(true);
          setFallbackLabel(
            t(
              "search.showingRelated",
              "No exact matches. Showing related providers."
            )
          );
          return;
        }
      }

      setServices([]);
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, id, searchCity, searchDistrict, t]);

  const getCategoryLabel = () => {
    if (services.length > 0) {
      const category = services[0]?.service?.category?.[0];
      if (category) {
        return currentLang === "cz" ? category?.cz_label : category?.label;
      }
    }
    return "";
  };

  const categoryLabel = getCategoryLabel();

  const getImageForCategory = (name) => {
    if (!name) return clean;
    return clean;
  };

  const handleBookingClick = (service) => {
    if (!token) {
      navigate(getLocalizedPath("/sign-in", i18n.language));
    } else {
      setSelectedService(service);
      setShowBookingModal(true);
    }
  };

  const confirmBooking = async () => {
    if (!selectedService) return;

    try {
      const response = await dispatch(
        createBooking({
          providerServiceId: selectedService._id,
          bookingDate: new Date(bookingDate),
          totalPrice: selectedService.price,
          note,
        })
      );

      if (response?.status === 200) {
        dispatch(throwSuccess(response?.message));
      } else {
        dispatch(throwError(response?.message));
      }

      setShowBookingModal(false);
      setBookingDate("");
      setNote("");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await dispatch(getAllCategory());
      let services = response?.data || [];
      services = services.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setCategories(services);
    } catch (error) {
      console.error(t("section42.text27"), error);
    }
  }, [dispatch]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchServices();
        await fetchCategories();
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    loadData();
  }, [fetchServices, fetchCategories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setShowCityDropdown(false);
        setIsCityInputFocused(false);
      }
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(event.target)
      ) {
        setShowDistrictDropdown(false);
        setIsDistrictInputFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCitySelect = (item) => {
    const selectedCity = item.city;
    setCitySearchText(selectedCity);
    setSearchCity(selectedCity);
    setSelectedCityData(item);
    setShowCityDropdown(false);
    setIsCityInputFocused(false);

    if (cityInputRef.current) {
      cityInputRef.current.focus();
    }

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("city", selectedCity);
    setSearchParams(newSearchParams);
    setIsSearchMode(true);

    handleClearDistrict();
  };

  const handleDistrictSelect = (item) => {
    const selectedDistrict = item.district;
    setDistrictSearchText(selectedDistrict);
    setSearchDistrict(selectedDistrict);
    setShowDistrictDropdown(false);
    setIsDistrictInputFocused(false);

    if (districtInputRef.current) {
      districtInputRef.current.focus();
    }

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("district", selectedDistrict);
    setSearchParams(newSearchParams);
    setIsSearchMode(true);
  };

  const handleCityKeyDown = (e) => {
    if (e.key === "Enter" && citySearchText.trim()) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("city", citySearchText.trim());
      setSearchParams(newSearchParams);
      setShowCityDropdown(false);
      setIsSearchMode(true);
      setSearchCity(citySearchText.trim());
    }
  };

  const handleDistrictKeyDown = (e) => {
    if (e.key === "Enter" && districtSearchText.trim()) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("district", districtSearchText.trim());
      setSearchParams(newSearchParams);
      setShowDistrictDropdown(false);
      setIsSearchMode(true);
      setSearchDistrict(districtSearchText.trim());
    }
  };

  const handleClearCity = () => {
    setCitySearchText("");
    setSearchCity("");
    setSelectedCityData(null);
    setIsSearchMode(false);

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("city");
    setSearchParams(newSearchParams);
    setFilteredCities([]);
    setShowCityDropdown(false);
    handleClearDistrict();
  };

  const handleClearDistrict = () => {
    setDistrictSearchText("");
    setSearchDistrict("");
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("district");
    setSearchParams(newSearchParams);
    setFilteredDistricts([]);
    setShowDistrictDropdown(false);
  };

  const handleClearAllFilters = () => {
    handleClearCity();
    handleClearDistrict();
  };
  const handleCityInputFocus = () => {
    setIsCityInputFocused(true);
    setShowCityDropdown(true);
    setCityDropdownSearch(""); 
    setFilteredCities(formattedCities);
  };

  const handleDistrictInputFocus = () => {
    setIsDistrictInputFocused(true);
    setShowDistrictDropdown(true);
    setDistrictDropdownSearch("");
    let filtered = [];
    if (selectedCityData) {
      filtered = formattedDistricts.filter(
        (item) => item.cityId === selectedCityData.id
      );
    } else {
      filtered = formattedDistricts;
    }
    setFilteredDistricts(filtered);
  };

  const longDescription = useCallback(() => {
    if (categories.length > 0) {
      const category = categories?.find((cat) => cat._id === id);
      if (category) {
        return currentLang === "cz"
          ? category?.cz_long_description || ""
          : category?.long_description || "";
      }
    }
    return "";
  }, [categories, id, currentLang]);
  const formatPrice = (price, priceType, priceFrom, priceTo) => {
    const currencyUnit = currentLang === "cz" ? "Kc" : "CZK";

    if (priceType === "range") {
      const fromVal = priceFrom
        ? `${parseInt(priceFrom).toLocaleString("cs-CZ")} ${currencyUnit}`
        : "-";
      const toVal = priceTo
        ? `${parseInt(priceTo).toLocaleString("cs-CZ")} ${currencyUnit}`
        : "-";
      return `${fromVal} - ${toVal}`;
    }

    if (!price) return "-";
    const amount = `${parseInt(price).toLocaleString("cs-CZ")} ${currencyUnit}`;

    if (priceType === "hourly") {
      // CZ users should see: "1 099 Kc / hod"
      return `${amount} / ${t("providerServiceForm.perHour", "hod")}`;
    }

    return `${amount}`;
  };

  const getPriceTypeLabel = (priceType) => {
    if (priceType === "hourly") {
      return t("providerServiceForm.priceType.hourly", "Hourly");
    }
    if (priceType === "range") {
      return t("providerServiceForm.priceType.range", "Range");
    }
    return t("providerServiceForm.priceType.fixed", "Fixed");
  };

  const bullet = "\u2022";
  const maskPhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return `${bullet}${bullet}${bullet}${bullet}${bullet}`;
    if (digits.length >= 3) {
      return `+${digits.slice(0, 3)} ${bullet}${bullet}${bullet} ${bullet}${bullet}${bullet} ${bullet}${bullet}${bullet}`;
    }
    return `${bullet}${bullet}${bullet}${bullet}${bullet}`;
  };

  const formatPhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "-";
    return `+${digits}`;
  };

  const maskEmail = (value) => {
    if (!value || !String(value).includes("@")) {
      return `${bullet}${bullet}${bullet}${bullet}${bullet}@${bullet}${bullet}${bullet}${bullet}${bullet}.${bullet}${bullet}`;
    }
    const parts = String(value).split("@");
    const domain = parts[1] || "";
    const tld = domain.split(".").pop() || "";
    const maskedTld = tld ? `${bullet}${bullet}` : `${bullet}${bullet}`;
    return `${bullet}${bullet}${bullet}${bullet}${bullet}@${bullet}${bullet}${bullet}${bullet}${bullet}.${maskedTld}`;
  };

  const getPrimaryCategoryLabel = (service) => {
    const category = service?.service?.category?.[0];
    if (!category) return "";
    return currentLang === "cz"
      ? category.cz_label || category.label
      : category.label || category.cz_label;
  };

  const getShortDescription = (service) => {
    const providerDescription = (service?.description || "").trim();
    const fallbackDescription =
      currentLang === "cz"
        ? service?.service?.cz_description ||
          service?.service?.description ||
          ""
        : service?.service?.description ||
          service?.service?.cz_description ||
          "";
    const description = providerDescription || String(fallbackDescription).trim();

    if (!description) {
      return t("search.noDescription", "No description available");
    }

    return description.length > 220
      ? `${description.substring(0, 220)}...`
      : description;
  };

  const getLocationLabel = (service) => {
    const provider = service?.provider || {};
    const normalizeValue = (value) => {
      if (!value) return "";
      if (typeof value === "object") {
        if (currentLang === "cz") {
          return value.nameCs || value.nameEn || value.name || "";
        }
        return value.nameEn || value.nameCs || value.name || "";
      }
      return String(value);
    };

    const cityValue = normalizeValue(provider.city || service?.city);
    const districtValue = normalizeValue(provider.district || service?.district);
    const regionValue = normalizeValue(provider.regions || provider.region);

    if (cityValue && districtValue) return `${cityValue}, ${districtValue}`;
    if (cityValue) return cityValue;
    if (districtValue) return districtValue;
    if (regionValue) return regionValue;

    return "";
  };

  const handleRevealContact = (serviceId) => {
    if (!token) {
      dispatch(
        throwError(
          t(
            "search.loginToReveal",
            "Please log in to reveal contact details."
          )
        )
      );
      navigate(getLocalizedPath("/sign-in", i18n.language));
      return;
    }

    setRevealedContacts((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  if (loading) {
    return <SkeletonSubService />;
  }

  return (
    <div className="subservices-container">
      <div className="container">
        {services.length > 0 && (
          <div className="header-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="settitless mb-2">{categoryLabel}</h2>
                <p className="setminitext">{longDescription()}</p>
              </div>
            </div>

            <div className="search-results-info">
              <h3 className="setresulttext">
                {services.length} {t("section42.text25", "services found")}
                {(searchCity || searchDistrict) && (
                  <span className="ms-2 text-muted">
                    in {searchCity} {searchDistrict && `, ${searchDistrict}`}
                  </span>
                )}
              </h3>
              {isFallback && (
                <p className="text-muted mb-0 mt-2">{fallbackLabel}</p>
              )}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="search-section mb-4">
          <div className="row g-3">
            {/* City Search */}
            <div className="col-md-6">
              <div className="position-relative" ref={cityDropdownRef}>
                <label className="form-label mb-2">
                  <CiLocationOn className="me-2" />
                  {t("search.searchCity", "Search City")}
                </label>
                <div className="position-relative">
                  <input
                    style={{ paddingLeft: "40px" }}
                    ref={cityInputRef}
                    type="text"
                    placeholder={
                      loadingCities
                        ? "Loading cities..."
                        : t("search.enterCity", "Enter city name...")
                    }
                    value={citySearchText}
                    disabled={loadingCities}
                    onFocus={handleCityInputFocus}
                    onChange={(e) => {
                      setCitySearchText(e.target.value);
                    }}
                    onKeyDown={handleCityKeyDown}
                    className={`form-control form-control-lg ${
                      isCityInputFocused ? "focused" : ""
                    } ${loadingCities ? "loading" : ""}`}
                  />

                  <CiLocationOn
                    className="position-absolute top-50 translate-middle-y"
                    style={{ left: "15px", color: "#6c757d" }}
                    size={20}
                  />

                  {!loadingCities && citySearchText && (
                    <button
                      className="btn btn-link position-absolute top-50 translate-middle-y end-0 me-3"
                      onClick={handleClearCity}
                      style={{ zIndex: 10 }}
                      title="Clear city search"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {showCityDropdown && (
                  <div
                    className="dropdown-menu show w-100"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      marginTop: "2px",
                      display: "block",
                      position: "absolute",
                      zIndex: 1000,
                    }}
                  >
                    <div className="dropdown-search p-2 border-bottom">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search cities..."
                        value={cityDropdownSearch}
                        onChange={(e) => setCityDropdownSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>

                    {filteredCities.length > 0 ? (
                      filteredCities.map((item, index) => (
                        <button
                          key={`${item.id || item.city}-${index}`}
                          type="button"
                          className="dropdown-item d-flex justify-content-between align-items-center"
                          onClick={() => handleCitySelect(item)}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="fw-medium">{item.city}</span>
                          <small className="text-muted">{item.region}</small>
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-item text-muted text-center py-3">
                        {cityDropdownSearch
                          ? "No cities found"
                          : "Loading cities..."}
                      </div>
                    )}
                  </div>
                )}
                {loadingCities && (
                  <div className="mt-1 text-muted small">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading cities...
                  </div>
                )}
              </div>
            </div>

            {/* District Search */}
            <div className="col-md-6">
              <div className="position-relative" ref={districtDropdownRef}>
                <label className="form-label mb-2">
                  <CiLocationOn className="me-2" />
                  {t("search.searchDistrict", "Search District")}
                </label>
                <div className="position-relative">
                  <input
                    style={{ paddingLeft: "40px" }}
                    ref={districtInputRef}
                    type="text"
                    placeholder={
                      loadingDistricts
                        ? "Loading districts..."
                        : searchCity
                        ? `Search districts in ${searchCity}...`
                        : t("search.enterDistrict", "Enter district name...")
                    }
                    value={districtSearchText}
                    disabled={loadingDistricts || (searchCity && loadingCities)}
                    onFocus={handleDistrictInputFocus}
                    onChange={(e) => {
                      setDistrictSearchText(e.target.value);
                      setIsDistrictInputFocused(true);
                      setShowDistrictDropdown(true);
                    }}
                    onKeyDown={handleDistrictKeyDown}
                    className={`form-control form-control-lg ${
                      isDistrictInputFocused ? "focused" : ""
                    } ${loadingDistricts ? "loading" : ""}`}
                  />

                  <CiLocationOn
                    className="position-absolute top-50 translate-middle-y"
                    style={{ left: "15px", color: "#6c757d" }}
                    size={20}
                  />

                  {!loadingDistricts && districtSearchText && (
                    <button
                      className="btn btn-link position-absolute top-50 translate-middle-y end-0 me-3"
                      onClick={handleClearDistrict}
                      style={{ zIndex: 10 }}
                      title="Clear district search"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                {showDistrictDropdown && (
                  <div
                    className="dropdown-menu show w-100"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      marginTop: "2px",
                      display: "block",
                      position: "absolute",
                      zIndex: 1000,
                    }}
                  >
                    <div className="dropdown-search p-2 border-bottom">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={
                          searchCity
                            ? `Search districts in ${searchCity}...`
                            : "Search districts..."
                        }
                        value={districtDropdownSearch}
                        onChange={(e) =>
                          setDistrictDropdownSearch(e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>

                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map((item, index) => (
                        <button
                          key={`${item.id || item.district}-${index}`}
                          type="button"
                          className="dropdown-item"
                          onClick={() => handleDistrictSelect(item)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.district}
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-item text-muted text-center py-3">
                        {districtDropdownSearch
                          ? searchCity
                            ? `No districts found in ${searchCity}`
                            : "No districts found"
                          : "Loading districts..."}
                      </div>
                    )}
                  </div>
                )}
                {loadingDistricts && (
                  <div className="mt-1 text-muted small">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading districts...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          {services.length > 0 ? (
            services.map((service) => {
              // --- Data Preparation ---
              const displayTitle =
                currentLang === "cz"
                  ? service?.service?.cz_title || "-"
                  : service?.service?.title || "-";

              const primaryCategoryLabel = getPrimaryCategoryLabel(service);

              const subCategoryList = Array.isArray(service?.subCategories)
                ? service.subCategories.filter(Boolean)
                : service?.subService?.name
                  ? [service.subService.name]
                  : [];

              const providerPhone =
                service?.provider?.phoneNumber || service?.provider?.phone;
              const providerEmail = service?.provider?.email || "";
              const providerAddress =
                service?.provider?.kycAddress ||
                service?.provider?.address ||
                service?.provider?.providerDetails?.address ||
                "";

              const locationLabel =
                getLocationLabel(service) ||
                t("search.locationNotSpecified", "Location not specified");

              const isContactRevealed =
                !!token && !!revealedContacts[service._id];

              const displayPhone = isContactRevealed
                ? formatPhone(providerPhone)
                : maskPhone(providerPhone);

              const displayEmail = isContactRevealed
                ? providerEmail || "-"
                : maskEmail(providerEmail);

              const displayAddress = token
                ? providerAddress || "-"
                : `${bullet}${bullet}${bullet}${bullet}${bullet}`;
              const descriptionText = getShortDescription(service);
              const formattedPrice = formatPrice(
                service?.price,
                service?.priceType,
                service?.priceFrom,
                service?.priceTo
              );
              const priceTypeLabel = getPriceTypeLabel(service?.priceType);

              return (
                <div
                  key={service._id}
                  className="service-card mb-4"
                  style={{
                    display: "flex",
                    flexWrap: "wrap", // Allows stacking on mobile
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    transition: "transform 0.2s ease",
                    minHeight: "280px", // Base height
                    alignItems: "stretch", // Ensures image and content are same height
                  }}
                >
                  {/* Section 1: Fixed Left Image */}
                  <div
                    className="card-image-container"
                    style={{
                      flex: "0 0 280px", // Fixed width on desktop
                      width: "280px",    // Fallback
                      position: "relative",
                      // On mobile, this usually needs to be overridden to width: 100% via CSS class
                      // ideally add a media query class, but structurally:
                      minHeight: "200px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <img
                      src={
                        service?.image ||
                        service.service?.image ||
                        getImageForCategory(service?.service?.title)
                      }
                      alt={displayTitle}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                        backgroundColor: "#ffffff",
                      }}
                    />

                  </div>

                  {/* Section 2: Content Body */}
                  <div
                    className="card-details"
                    style={{
                      flex: "1",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minWidth: "300px", // Ensures grid doesn't break too early
                    }}
                  >
                    {/* Top: Header & Provider */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ width: "100%" }}>
                          <h4
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "1.35rem",
                              fontWeight: "700",
                              lineHeight: "1.2",
                              color: "#1a1a1a",
                            }}
                          >
                            {displayTitle}
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: "#6c757d",
                              fontSize: "0.95rem",
                            }}
                          >
                            <FaUser size={14} />
                            <span style={{ fontWeight: "500" }}>
                              {service.provider?.name ||
                                t("search.unknownProvider", "Unknown Provider")}
                            </span>
                            <span
                              className="badge video-badge"
                              style={{
                                fontSize: "0.7rem",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginLeft: "8px",
                                background: "linear-gradient(135deg, #22bf1e 0%, #1a9617 100%)",
                                color: "#fff",
                              }}
                            >
                              <i className="fas fa-shield-alt"></i>
                              {t("section42.text17", "Verified")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* --- NEW: Boxed Table Approach for Category --- */}
                      <div
                        className="category-table"
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          overflow: "hidden",
                          marginBottom: "16px",
                          fontSize: "0.9rem",
                        }}
                      >
                        {/* Row 1: Category */}
                        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
                          <div
                            style={{
                              width: "120px",
                              backgroundColor: "#f8f9fa",
                              padding: "8px 12px",
                              fontWeight: "600",
                              color: "#555",
                              borderRight: "1px solid #f0f0f0",
                              flexShrink: 0,
                            }}
                          >
                            {t("search.category", "Category")}
                          </div>
                          <div
                            style={{
                              padding: "8px 12px",
                              flex: 1,
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            {primaryCategoryLabel || displayTitle}
                          </div>
                        </div>

                        {/* Row 2: Sub-Category */}
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              width: "120px",
                              backgroundColor: "#f8f9fa",
                              padding: "8px 12px",
                              fontWeight: "600",
                              color: "#555",
                              borderRight: "1px solid #f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {t("search.subCategory", "Services")}
                          </div>
                          <div
                            style={{
                              padding: "8px 12px",
                              flex: 1,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            {subCategoryList.length > 0 ? (
                              subCategoryList.map((item, index) => (
                                <span
                                  key={`${item}-${index}`}
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#555",
                                    backgroundColor: "#fff",
                                    border: "1px solid #eee",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: "#999", fontStyle: "italic" }}>-</span>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Price */}
                        <div style={{ display: "flex", borderTop: "1px solid #f0f0f0" }}>
                          <div
                            style={{
                              width: "120px",
                              backgroundColor: "#f8f9fa",
                              padding: "8px 12px",
                              fontWeight: "600",
                              color: "#555",
                              borderRight: "1px solid #f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {t("section42.text16", "Price")}
                          </div>
                          <div
                            style={{
                              padding: "8px 12px",
                              flex: 1,
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: "8px",
                              lineHeight: "1.3",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                color: "#1b5e20",
                                backgroundColor: "#e8f5e9",
                                borderRadius: "999px",
                                padding: "2px 8px",
                              }}
                            >
                              {priceTypeLabel}
                            </span>
                            <span
                              style={{
                                fontWeight: "700",
                                color: "#22bf1e",
                                fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
                              }}
                            >
                              {formattedPrice}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* --- End Boxed Table --- */}

                      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", color: "#666" }}>
                        <CiLocationOn size={18} />
                        <span style={{ fontSize: "0.95rem" }}>{locationLabel}</span>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            color: "#444",
                            marginBottom: "6px",
                          }}
                        >
                          {t("providerServiceForm.description.title", "Description")}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "#666",
                            fontSize: "0.95rem",
                            lineHeight: "1.6",
                          }}
                        >
                          {descriptionText}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Contact & Actions */}
                    <div>
                      {/* Contact Box */}
                      <div
                        className="contact-section"
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          padding: "12px",
                          marginBottom: "16px",
                          border: "1px solid #eee",
                          fontSize: "0.9rem",
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#444' }}>{t("search.phoneLabel", "Phone")}:</strong>
                            <span>{displayPhone}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#444' }}>{t("search.emailLabel", "Email")}:</strong>
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayEmail}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', borderTop: '1px solid #e9ecef', paddingTop: '8px' }}>
                          <strong style={{ color: '#444' }}>{t("search.addressLabel", "Address")}:</strong>
                          <span style={{ color: '#666' }}>{displayAddress}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div
                        className="action-buttons-row"
                        style={{ display: "flex", gap: "12px" }}
                      >
                        <button
                          onClick={() => handleRevealContact(service._id)}
                          style={{
                            flex: "1",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            backgroundColor: "#fff",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            transition: "background 0.2s",
                          }}
                        >
                          {isContactRevealed ? <FaEyeSlash /> : <FaEye />}
                          {isContactRevealed
                            ? t("search.hideContact", "Hide")
                            : t("search.revealContact", "Show Contact")}
                        </button>
                        <button
                          onClick={() => handleBookingClick(service)}
                          disabled={service.status !== "active"}
                          style={{
                            flex: "1",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "none",
                            background: service.status === "active"
                              ? "linear-gradient(135deg, #22bf1e 0%, #1a9617 100%)"
                              : "#ccc",
                            color: "#fff",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            cursor: service.status === "active" ? "pointer" : "not-allowed",
                            fontSize: "0.9rem",
                          }}
                        >
                          <FaRegCreditCard />
                          {service.status === "active"
                            ? t("section42.text19", "Book Now")
                            : t("search.unavailable", "Unavailable")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty State (Kept exactly as previous)
            <div
              className="empty-state text-center"
              style={{
                padding: "60px 20px",
                backgroundColor: "#fff",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                marginTop: "20px",
              }}
            >
              <div
                className="empty-state-icon mb-4"
                style={{ opacity: "0.2", transform: "scale(0.9)" }}
              >
                <i className="fas fa-search fa-5x"></i>
              </div>
              <h3 className="mb-3" style={{ fontWeight: "700", color: "#333" }}>
                {t("search.noServicesAvailableYet", "No services available yet")}
              </h3>
              <p
                className="text-muted mb-5"
                style={{ maxWidth: "500px", margin: "0 auto", fontSize: "1.1rem" }}
              >
                {searchCity || searchDistrict
                  ? `${t("search.noResultsInCity", "No services found")} ${t(
                    "search.in",
                    "in"
                  )} "${decodeURIComponent(searchCity || "")}${searchDistrict ? `, ${decodeURIComponent(searchDistrict)}` : ""
                  }".`
                  : t(
                    "search.noResultsInCategory",
                    "No services found in this category."
                  )}
              </p>
              <div className="d-flex justify-content-center gap-3">
                {isSearchMode && (
                  <button
                    className="px-4 py-2"
                    style={{
                      border: "1px solid #132c4e",
                      borderRadius: "50px",
                      padding: "10px 24px",
                      fontWeight: "600",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={handleClearAllFilters}
                  >
                    <FaTimes className="me-2" />
                    {t("search.clearAllFilters", "Clear All Filters")}
                  </button>
                )}
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate(getLocalizedPath("/", i18n.language))}
                  style={{
                    borderRadius: "50px",
                    padding: "10px 24px",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-home me-2"></i>
                  {t("search.backToHome", "Back to Home")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          today={new Date().toISOString().split("T")[0]}
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          note={note}
          setNote={setNote}
          onClose={() => setShowBookingModal(false)}
          onConfirm={confirmBooking}
        />
      )}
    </div>
  );
};

export default SubServices;
