import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import regionsEn from "pages/Auth/Register/regions_en.json";
import regionsCz from "pages/Auth/Register/regions_cz.json";

const CUSTOM_DISTRICT_VALUE = "__custom";

const toSafeString = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const normalizeCollectionValue = (collection = [], rawValue = "") => {
  const value = toSafeString(rawValue);
  if (!value) return null;

  return (
    collection.find((entry) => String(entry?._id) === value) ||
    collection.find(
      (entry) => String(entry?.nameEn || "").toLowerCase() === value.toLowerCase()
    ) ||
    null
  );
};

const BecomeProviderModal = ({
  open = false,
  onClose,
  onSubmit,
  loading = false,
  profileData = {},
}) => {
  const { t, i18n } = useTranslation();

  const [formValues, setFormValues] = useState({
    region: "",
    city: "",
    district: "",
    customDistrict: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);

  const mappedRegions = useMemo(() => {
    const dataset =
      (i18n.language || "").toLowerCase().startsWith("en") ? regionsEn : regionsCz;
    return (dataset.regions || []).map((regionItem) => ({
      _id: regionItem.id,
      nameEn: regionItem.name,
      cities:
        regionItem.cities?.map((cityItem) => ({
          _id: cityItem.id,
          nameEn: cityItem.name,
          districts:
            cityItem.districts?.map((districtItem) => ({
              _id: districtItem.id,
              nameEn: districtItem.name,
            })) || [],
        })) || [],
    }));
  }, [i18n.language]);

  useEffect(() => {
    if (!open) return;

    const initialRegionRaw =
      profileData?.regions || profileData?.region || profileData?.regionId || "";
    const regionObj = normalizeCollectionValue(mappedRegions, initialRegionRaw);
    const nextCities = regionObj?.cities || [];

    const initialCityRaw =
      profileData?.city || profileData?.cityId || profileData?.cityName || "";
    const cityObj =
      normalizeCollectionValue(nextCities, initialCityRaw) ||
      normalizeCollectionValue(
        mappedRegions.flatMap((entry) => entry.cities || []),
        initialCityRaw
      );
    const nextDistricts = cityObj?.districts || [];

    const initialDistrictRaw =
      profileData?.district || profileData?.districtId || profileData?.districtName || "";
    const districtObj =
      normalizeCollectionValue(nextDistricts, initialDistrictRaw) ||
      normalizeCollectionValue(
        mappedRegions.flatMap((entry) =>
          (entry.cities || []).flatMap((cityEntry) => cityEntry.districts || [])
        ),
        initialDistrictRaw
      );

    const initialAddress =
      toSafeString(profileData?.address) ||
      toSafeString(profileData?.providerDetails?.address);

    setFilteredCities(nextCities);
    setFilteredDistricts(nextDistricts);
    setErrors({});
    setFormValues({
      region: regionObj?._id || "",
      city: cityObj?._id || "",
      district: districtObj?._id || (toSafeString(initialDistrictRaw) ? CUSTOM_DISTRICT_VALUE : ""),
      customDistrict: districtObj ? "" : toSafeString(initialDistrictRaw),
      address: initialAddress,
    });
  }, [mappedRegions, open, profileData]);

  if (!open) return null;

  const setFieldValue = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleRegionChange = (event) => {
    const regionValue = event.target.value;
    const regionObj = normalizeCollectionValue(mappedRegions, regionValue);
    const cities = regionObj?.cities || [];

    setFilteredCities(cities);
    setFilteredDistricts([]);
    setFormValues((prev) => ({
      ...prev,
      region: regionValue,
      city: "",
      district: "",
      customDistrict: "",
    }));
    setErrors((prev) => ({
      ...prev,
      region: "",
      city: "",
      district: "",
      customDistrict: "",
    }));
  };

  const handleCityChange = (event) => {
    const cityValue = event.target.value;
    const cityObj = normalizeCollectionValue(filteredCities, cityValue);
    const districts = cityObj?.districts || [];

    setFilteredDistricts(districts);
    setFormValues((prev) => ({
      ...prev,
      city: cityValue,
      district: "",
      customDistrict: "",
    }));
    setErrors((prev) => ({
      ...prev,
      city: "",
      district: "",
      customDistrict: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!toSafeString(formValues.region)) {
      nextErrors.region = t("section20.text17", "Select region");
    }
    if (!toSafeString(formValues.city)) {
      nextErrors.city = t("section20.text18", "Select city");
    }

    if (!toSafeString(formValues.district)) {
      nextErrors.district = t("section20.district", "Select district");
    } else if (formValues.district === CUSTOM_DISTRICT_VALUE) {
      if (!toSafeString(formValues.customDistrict)) {
        nextErrors.customDistrict = t(
          "section20.districtRequired",
          "Please enter your district"
        );
      }
    }

    if (!toSafeString(formValues.address)) {
      nextErrors.address = t("section20.addressRequired", "Address is required");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!validateForm()) return;

    const regionObj = normalizeCollectionValue(mappedRegions, formValues.region);
    const cityObj = normalizeCollectionValue(filteredCities, formValues.city);
    const districtObj = normalizeCollectionValue(
      filteredDistricts,
      formValues.district
    );
    const customDistrict =
      formValues.district === CUSTOM_DISTRICT_VALUE
        ? toSafeString(formValues.customDistrict)
        : "";

    const payload = {
      termsVersion: "v1",
      region: regionObj?.nameEn || toSafeString(formValues.region),
      city: cityObj?.nameEn || toSafeString(formValues.city),
      district:
        customDistrict ||
        districtObj?.nameEn ||
        toSafeString(formValues.district),
      regionId: regionObj?._id || toSafeString(formValues.region),
      cityId: cityObj?._id || toSafeString(formValues.city),
      districtId:
        customDistrict ||
        !districtObj?._id
          ? "custom"
          : districtObj._id,
      address: toSafeString(formValues.address),
    };

    const success = await onSubmit?.(payload);
    if (success) {
      onClose?.();
    }
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[1200] tw-flex tw-items-center tw-justify-center tw-bg-black/55 tw-p-4">
      <div className="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-bg-white tw-shadow-2xl">
        <div className="tw-border-b tw-border-slate-200 tw-px-6 tw-py-4">
          <h3 className="tw-m-0 tw-text-lg tw-font-semibold tw-text-slate-900">
            {t("profileDetails.becomeProvider", "Become Provider")}
          </h3>
          <p className="tw-mb-0 tw-mt-1 tw-text-sm tw-text-slate-500">
            {t(
              "profileDetails.providerAddressPrompt",
              "Please provide your service location details before switching."
            )}
          </p>
        </div>

        <div className="tw-grid tw-grid-cols-1 tw-gap-4 tw-p-6 md:tw-grid-cols-2">
          <div>
            <label className="tw-mb-1 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
              {t("section20.regions")}
            </label>
            <select
              value={formValues.region}
              onChange={handleRegionChange}
              className="tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm focus:tw-border-emerald-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-emerald-100"
            >
              <option value="">{t("section20.text17", "Select region")}</option>
              {mappedRegions.map((regionItem) => (
                <option key={regionItem._id} value={regionItem._id}>
                  {regionItem.nameEn}
                </option>
              ))}
            </select>
            {errors.region && (
              <p className="tw-mb-0 tw-mt-1 tw-text-xs tw-text-red-600">{errors.region}</p>
            )}
          </div>

          <div>
            <label className="tw-mb-1 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
              {t("section20.city")}
            </label>
            <select
              value={formValues.city}
              onChange={handleCityChange}
              disabled={!formValues.region}
              className="tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm focus:tw-border-emerald-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-emerald-100 disabled:tw-cursor-not-allowed disabled:tw-bg-slate-100"
            >
              <option value="">
                {!formValues.region
                  ? t("section20.text17", "Select region")
                  : t("section20.text18", "Select city")}
              </option>
              {filteredCities.map((cityItem) => (
                <option key={cityItem._id} value={cityItem._id}>
                  {cityItem.nameEn}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="tw-mb-0 tw-mt-1 tw-text-xs tw-text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="tw-mb-1 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
              {t("section20.district")}
            </label>
            <select
              value={formValues.district}
              onChange={(event) => setFieldValue("district", event.target.value)}
              disabled={!formValues.city}
              className="tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm focus:tw-border-emerald-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-emerald-100 disabled:tw-cursor-not-allowed disabled:tw-bg-slate-100"
            >
              <option value="">
                {!formValues.city
                  ? t("section20.text18", "Select city")
                  : t("section20.district", "Select district")}
              </option>
              {filteredDistricts.map((districtItem) => (
                <option key={districtItem._id} value={districtItem._id}>
                  {districtItem.nameEn}
                </option>
              ))}
              <option value={CUSTOM_DISTRICT_VALUE}>
                {t("section20.otherDistrict", "Other / enter manually")}
              </option>
            </select>
            {errors.district && (
              <p className="tw-mb-0 tw-mt-1 tw-text-xs tw-text-red-600">{errors.district}</p>
            )}
          </div>

          <div>
            <label className="tw-mb-1 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
              {t("section20.address", "Address")}
            </label>
            <input
              type="text"
              value={formValues.address}
              onChange={(event) => setFieldValue("address", event.target.value)}
              placeholder={t(
                "section20.addressPlaceholder",
                "Street, house number, area"
              )}
              className="tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm focus:tw-border-emerald-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-emerald-100"
            />
            {errors.address && (
              <p className="tw-mb-0 tw-mt-1 tw-text-xs tw-text-red-600">{errors.address}</p>
            )}
          </div>

          {formValues.district === CUSTOM_DISTRICT_VALUE && (
            <div className="md:tw-col-span-2">
              <label className="tw-mb-1 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
                {t("section20.district")} - {t("section20.text10", "Manual entry")}
              </label>
              <input
                type="text"
                value={formValues.customDistrict}
                onChange={(event) =>
                  setFieldValue("customDistrict", event.target.value)
                }
                placeholder={t("section20.districtInput", "Type your district")}
                className="tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm focus:tw-border-emerald-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-emerald-100"
              />
              {errors.customDistrict && (
                <p className="tw-mb-0 tw-mt-1 tw-text-xs tw-text-red-600">
                  {errors.customDistrict}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="tw-flex tw-justify-end tw-gap-3 tw-border-t tw-border-slate-200 tw-px-6 tw-py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-slate-700 hover:tw-bg-slate-100 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="tw-rounded-lg tw-bg-emerald-600 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white hover:tw-bg-emerald-700 disabled:tw-cursor-not-allowed disabled:tw-opacity-70"
          >
            {loading
              ? t("profileDetails.becomingProvider", "Processing...")
              : t("profileDetails.becomeProvider", "Become Provider")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeProviderModal;
