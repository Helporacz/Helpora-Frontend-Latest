import Button from "components/form/Button/Button";
import { ErrorMessage, Field, Formik } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  throwError,
  throwSuccess,
  updateProvider,
  userRegister,
} from "store/globalSlice";
import * as Yup from "yup";
import regionsDataEn from "pages/Auth/Register/regions_en.json";
import regionsDataCz from "pages/Auth/Register/regions_cz.json";

const getDefaultValues = () => ({
  name: "",
  email: "",
  region: "",
  city: "",
  district: "",
  phoneNumber: "",
  password: "",
  address: "",
  role: "provider",
  termsAccepted: true,
  termsVersion: "v1",
  privacyAccepted: true,
  privacyVersion: "v1",
  is_ranked: false,
  ranking_position: "",
  ranking_start_at: "",
  ranking_end_at: "",
  rank_badge_label: "",
});

const formatInitialPhoneValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const stringValue = String(value);
  return stringValue.startsWith("+") ? stringValue : `+${stringValue}`;
};

const formatDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (input) => String(input).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const normalizeLabel = (value) => {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getCandidateText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object") {
    return value.nameEn || value.nameCs || value.name || "";
  }
  return "";
};

const FormField = ({ label, required = false, children, errorName }) => (
  <div>
    <label>
      {label} {required && <span style={{ color: "red" }}>*</span>}
    </label>
    <div className="input-wrapper">
      {children}
      {errorName && (
        <ErrorMessage
          name={errorName}
          component="div"
          className="invalid-feedback d-block"
        />
      )}
    </div>
  </div>
);

const ProviderModal = ({
  show,
  onHide,
  onSuccess,
  handelSuccess,
  initialValues = null,
  isUpdate = false,
  userId,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const formRef = useRef();
  const [btnLoading, setBtnLoading] = useState(false);
  const [invalidPhone, setInvalidPhone] = useState(false);

  const [allRegions, setAllRegions] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  const resolvedRegionId = useMemo(() => {
    if (!isUpdate || !initialValues) {
      return "";
    }

    const candidateText = [
      initialValues.regionId,
      initialValues.regions,
      initialValues.region,
      initialValues.region?.nameEn,
      initialValues.region?.nameCs,
    ]
      .map(getCandidateText)
      .find(Boolean);

    if (!candidateText) return "";
    if (allRegions.length === 0) return candidateText;

    const directMatch = allRegions.find((region) => region.id === candidateText);
    if (directMatch) return directMatch.id;

    const normalizedCandidate = normalizeLabel(candidateText);
    const nameMatch = allRegions.find(
      (region) => normalizeLabel(region.name) === normalizedCandidate
    );

    return nameMatch?.id || "";
  }, [allRegions, initialValues, isUpdate]);

  const resolvedCityId = useMemo(() => {
    if (!isUpdate || !initialValues) {
      return "";
    }

    const candidateText = [
      initialValues.cityId,
      initialValues.city,
      initialValues.city?.nameEn,
      initialValues.city?.nameCs,
    ]
      .map(getCandidateText)
      .find(Boolean);

    if (!candidateText) return "";
    if (allCities.length === 0) return candidateText;

    const cityPool = resolvedRegionId
      ? allCities.filter((city) => city.regionId === resolvedRegionId)
      : allCities;

    const directMatch = cityPool.find((city) => city.id === candidateText);
    if (directMatch) return directMatch.id;

    const normalizedCandidate = normalizeLabel(candidateText);
    const nameMatch = cityPool.find(
      (city) => normalizeLabel(city.name) === normalizedCandidate
    );

    return nameMatch?.id || "";
  }, [allCities, initialValues, isUpdate, resolvedRegionId]);

  const resolvedDistrictId = useMemo(() => {
    if (!isUpdate || !initialValues) {
      return "";
    }

    const candidateText = [
      initialValues.districtId,
      initialValues.district,
      initialValues.district?.nameEn,
      initialValues.district?.nameCs,
    ]
      .map(getCandidateText)
      .find(Boolean);

    if (!candidateText) return "";
    if (allDistricts.length === 0) return candidateText;

    const districtPool = resolvedCityId
      ? allDistricts.filter((district) => district.cityId === resolvedCityId)
      : allDistricts;

    const directMatch = districtPool.find(
      (district) => district.id === candidateText
    );
    if (directMatch) return directMatch.id;

    const normalizedCandidate = normalizeLabel(candidateText);
    const nameMatch = districtPool.find(
      (district) => normalizeLabel(district.name) === normalizedCandidate
    );

    return nameMatch?.id || "";
  }, [allDistricts, initialValues, isUpdate, resolvedCityId]);

  useEffect(() => {
    if (!show) return;

    setLoading(true);
    const dataset = i18n.language === "cz" ? regionsDataCz : regionsDataEn;
    const regionsList =
      dataset?.regions?.map((r) => ({
        id: r.id,
        name: r.name,
        cities: r.cities || [],
      })) || [];

    const citiesList = regionsList.flatMap((r) =>
      (r.cities || []).map((c) => ({
        id: c.id,
        name: c.name,
        regionId: r.id,
        districts: c.districts || [],
      }))
    );

    const districtsList = citiesList.flatMap((c) =>
      (c.districts || []).map((d) => ({
        id: d.id,
        name: d.name,
        cityId: c.id,
      }))
    );

    setAllRegions(regionsList);
    setAllCities(citiesList);
    setAllDistricts(districtsList);
    setFilteredCities(citiesList);
    setFilteredDistricts([]);
    setLoading(false);
  }, [i18n.language, show]);

  useEffect(() => {
    if (!show || !resolvedRegionId || !allCities.length) return;
    filterCitiesByRegion(resolvedRegionId);
  }, [show, resolvedRegionId, allCities]);

  useEffect(() => {
    if (!show || !resolvedCityId || !allDistricts.length) return;
    filterDistrictsByCity(resolvedCityId);
  }, [show, resolvedCityId, allDistricts]);

  useEffect(() => {
    if (!isUpdate && initialValues?.region) {
      const selectedRegionId = initialValues.region?._id || initialValues.region;
      if (selectedRegionId) {
        filterCitiesByRegion(selectedRegionId);
      }
    }
  }, [allCities, isUpdate, initialValues?.region]);

  useEffect(() => {
    if (!isUpdate && initialValues?.city) {
      const selectedCityId = initialValues.city?._id || initialValues.city;
      if (selectedCityId) {
        filterDistrictsByCity(selectedCityId);
      }
    }
  }, [allDistricts, isUpdate, initialValues?.city]);

  const filterCitiesByRegion = (regionId) => {
    if (!regionId) {
      setFilteredCities(allCities);
      return;
    }

    const filtered = allCities.filter((city) => city.regionId === regionId);
    setFilteredCities(filtered);
  };

  const filterDistrictsByCity = (cityId) => {
    if (!cityId) {
      setFilteredDistricts(allDistricts);
      return;
    }

    const filtered = allDistricts.filter((district) => district.cityId === cityId);
    setFilteredDistricts(filtered);
  };

  const createValidationSchema = (isUpdate) =>
    Yup.object().shape({
      name: Yup.string()
        .trim()
        .required(t("addProvider.nameValidation")),
      email: Yup.string()
        .trim()
        .email(t("addProvider.emailValidation"))
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Must be a valid email address."
        )
        .required(t("addProvider.emailValidation2")),
      phoneNumber: Yup.string()
        .trim()
        .required(t("addProvider.numberValidation"))
        .min(8, t("addProvider.numberValidation"))
        .max(20, t("addProvider.numberValidation")),
      password: isUpdate
        ? Yup.string().nullable()
        : Yup.string()
            .required(t("addProvider.passwordValidation"))
            .min(8, t("addProvider.passwordValidation2"))
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
              t("addProvider.passwordValidation2")
            ),
      address: isUpdate
        ? Yup.string()
            .trim()
            .required(t("addProvider.addressValidation"))
            .min(5, t("addProvider.addressValidation2"))
        : Yup.string().notRequired(),
      region: Yup.string().required(t("addProvider.regionValidation")),
      city: Yup.string().required(t("addProvider.cityValidation")),
      is_ranked: Yup.boolean(),
      ranking_position: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" || originalValue === null ? null : value
        )
        .nullable()
        .when("is_ranked", {
          is: true,
          then: (schema) =>
            schema
              .required(t("addProvider.rankingPositionRequired"))
              .integer(t("addProvider.rankingPositionInteger"))
              .positive(t("addProvider.rankingPositionPositive")),
          otherwise: (schema) => schema.nullable(),
        }),
      ranking_start_at: Yup.date()
        .transform((value, originalValue) =>
          originalValue === "" || originalValue === null ? null : value
        )
        .nullable(),
      ranking_end_at: Yup.date()
        .transform((value, originalValue) =>
          originalValue === "" || originalValue === null ? null : value
        )
        .nullable()
        .test(
          "ranking-date-order",
          t("addProvider.rankingDateValidation"),
          function (value) {
            const { ranking_start_at: rankingStartAt } = this.parent;
            if (!value || !rankingStartAt) return true;
            return new Date(value) >= new Date(rankingStartAt);
          }
        ),
    });

  const handleSave = async (values) => {
    setBtnLoading(true);
    try {
      const payload = { ...values };
      const regionObj = allRegions.find((r) => r.id === payload.region);
      const cityObj = allCities.find((c) => c.id === payload.city);
      const districtObj = allDistricts.find((d) => d.id === payload.district);

      payload.regions = regionObj?.name || payload.region;
      payload.region = regionObj?.name || payload.region;
      payload.regionId = regionObj?.id;
      payload.city = cityObj?.name || payload.city;
      payload.cityId = cityObj?.id;
      payload.district = districtObj?.name || payload.district;
      payload.districtId = districtObj?.id;
      
      if (!isUpdate) {
        payload.role = "provider";
        delete payload.is_ranked;
        delete payload.ranking_position;
        delete payload.ranking_start_at;
        delete payload.ranking_end_at;
        delete payload.rank_badge_label;
      } else {
        const rankingEnabled = !!values.is_ranked;
        payload.is_ranked = rankingEnabled;
        payload.ranking_position =
          rankingEnabled && values.ranking_position !== ""
            ? Number(values.ranking_position)
            : null;
        payload.ranking_start_at =
          rankingEnabled && values.ranking_start_at
            ? new Date(values.ranking_start_at).toISOString()
            : null;
        payload.ranking_end_at =
          rankingEnabled && values.ranking_end_at
            ? new Date(values.ranking_end_at).toISOString()
            : null;
        payload.rank_badge_label = values.rank_badge_label?.trim()
          ? values.rank_badge_label.trim()
          : null;
      }

      const response =
        isUpdate && userId
          ? await dispatch(updateProvider({ id: userId, payload }))
          : await dispatch(userRegister(payload));

      const updatedPayload = response?.data?.updatedUser ?? response?.data;
      if (response?.status === 200) {
        const successMessage = isUpdate
          ? t("messages.providerUpdatedSuccessfully")
          : t("messages.providerAddedSuccessfully");
        dispatch(throwSuccess(successMessage));
        onSuccess?.(updatedPayload);
        handelSuccess?.(updatedPayload);
        onHide();
      } else {
        const errorMsg = response?.message || t("messages.emailAlreadyExists");
        dispatch(throwError(errorMsg));
      }
    } catch (error) {
      console.error("Error saving provider:", error);
      dispatch(throwError(t("messages.errorSavingProvider")));
    } finally {
      setBtnLoading(false);
    }
  };

  const normalizedInitialValues = useMemo(() => {
    if (!isUpdate || !initialValues) {
      return getDefaultValues();
    }

    return {
      ...initialValues,
      phoneNumber: formatInitialPhoneValue(initialValues.phoneNumber),
      region: resolvedRegionId || "",
      city: resolvedCityId || "",
      district: resolvedDistrictId || "",
      is_ranked: !!initialValues.is_ranked,
      ranking_position:
        initialValues.ranking_position === null ||
        typeof initialValues.ranking_position === "undefined"
          ? ""
          : String(initialValues.ranking_position),
      ranking_start_at: formatDateTimeLocalValue(initialValues.ranking_start_at),
      ranking_end_at: formatDateTimeLocalValue(initialValues.ranking_end_at),
      rank_badge_label: initialValues.rank_badge_label || "",
    };
  }, [initialValues, isUpdate, resolvedCityId, resolvedDistrictId, resolvedRegionId]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isUpdate
            ? t("addProvider.updateHeading")
            : t("addProvider.addHeading")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          innerRef={formRef}
          initialValues={normalizedInitialValues}
          validationSchema={createValidationSchema(isUpdate)}
          onSubmit={handleSave}
          enableReinitialize
        >
          {({ submitForm, setFieldValue, values }) => (
            <form
              onSubmit={submitForm}
              onKeyDown={(e) => e.key === "Enter" && submitForm(e)}
              className="d-flex flex-column gap-3"
            >
              <FormField
                label={t("addProvider.name")}
                required
                errorName="name"
              >
                <Field
                  type="text"
                  name="name"
                  placeholder={t("addProvider.namePlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <FormField
                label={t("addProvider.email")}
                required
                errorName="email"
              >
                <Field
                  type="email"
                  name="email"
                  placeholder={t("addProvider.emailPlaceHolder")}
                  className="form-control"
                />
              </FormField>

              <FormField
                label={t("addProvider.number")}
                errorName="phoneNumber"
              >
                <PhoneInput
                  country="cz"
                  value={values.phoneNumber}
                  onChange={(value) => {
                    const withPlus = value.startsWith("+") ? value : `+${value}`;
                    setFieldValue("phoneNumber", withPlus);
                    setInvalidPhone(false);
                  }}
                  onBlur={() => {
                    setInvalidPhone(!values.phoneNumber);
                  }}
                  inputProps={{
                    name: "phoneNumber",
                    required: true,
                    disabled: false,
                  }}
                  containerStyle={{
                    width: "100%",
                    display: "block",
                  }}
                  containerClass=""
                  inputStyle={{
                    width: "100%",
                    height: "calc(1.5em + .75rem + 2px)",
                    borderRadius: "0.375rem",
                    borderColor: invalidPhone ? "#dc3545" : "#ced4da",
                    paddingLeft: "48px",
                    boxSizing: "border-box",
                  }}
                  buttonStyle={{
                    height: "calc(1.5em + .75rem + 2px)",
                    borderColor: invalidPhone ? "#dc3545" : "#ced4da",
                    borderRadius: "0.375rem 0 0 0.375rem",
                    backgroundColor: "#fff",
                  }}
                />
                {invalidPhone && (
                  <div className="invalid-feedback d-block">
                    {t("addProvider.numberValidation")}
                  </div>
                )}
              </FormField>

              {/* Region Select */}
              <FormField
                label={t("section20.regions")}
                required
                errorName="region"
              >
                <Field
                  as="select"
                  name="region"
                  className="form-control"
                  onChange={(e) => {
                    const regionId = e.target.value;
                    setFieldValue("region", regionId);
                    setFieldValue("city", "");
                    setFieldValue("district", "");
                    filterCitiesByRegion(regionId);
                    setFilteredDistricts([]);
                  }}
                >
                  <option value="">{loading ? "Loading..." : t("section20.selectRegion", "Select Region")}</option>
                  {allRegions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </Field>
              </FormField>

              {/* City Select */}
              <FormField
                label={t("section20.city")}
                required
                errorName="city"
              >
                <Field
                  as="select"
                  name="city"
                  className="form-control"
                  disabled={!values.region}
                  onChange={(e) => {
                    const cityId = e.target.value;
                    setFieldValue("city", cityId);
                    setFieldValue("district", "");
                    filterDistrictsByCity(cityId);
                  }}
                >
                  <option value="">
                    {!values.region 
                      ? "Select Region First" 
                      : filteredCities.length === 0 
                        ? "No cities available" 
                        : "Select City"}
                  </option>
                  {filteredCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Field>
              </FormField>

              {/* District Select */}
              <FormField
                label={t("section20.district")}
                errorName="district"
              >
                <Field
                  as="select"
                  name="district"
                  className="form-control"
                  disabled={!values.city}
                >
                  <option value="">
                    {!values.city 
                      ? "Select City First" 
                      : filteredDistricts.length === 0 
                        ? "No districts available" 
                        : "Select District (Optional)"}
                  </option>
                  {filteredDistricts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Field>
              </FormField>

              {!isUpdate && (
                <FormField
                  label={t("addProvider.password")}
                  required
                  errorName="password"
                >
                  <Field
                    type="password"
                    name="password"
                    placeholder={t("addProvider.password")}
                    className="form-control"
                  />
                </FormField>
              )}

              {isUpdate && (
                <FormField
                  label={t("addProvider.address")}
                  required
                  errorName="address"
                >
                  <Field
                    as="textarea"
                    name="address"
                    placeholder={t("addProvider.addressPlaceHolder")}
                    className="form-control"
                  />
                </FormField>
              )}

              {isUpdate && (
                <div className="border rounded p-3">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                    <div>
                      <div className="fw-semibold">
                        {t("addProvider.rankingSectionTitle")}
                      </div>
                      <div className="text-muted small">
                        {t("addProvider.rankingSectionHint")}
                      </div>
                    </div>
                    <div className="form-check form-switch m-0">
                      <input
                        id="provider-ranking-toggle"
                        type="checkbox"
                        className="form-check-input"
                        checked={!!values.is_ranked}
                        onChange={(event) => {
                          const enabled = event.target.checked;
                          setFieldValue("is_ranked", enabled);
                          if (!enabled) {
                            setFieldValue("ranking_position", "");
                            setFieldValue("ranking_start_at", "");
                            setFieldValue("ranking_end_at", "");
                          }
                        }}
                      />
                      <label
                        htmlFor="provider-ranking-toggle"
                        className="form-check-label small"
                      >
                        {values.is_ranked
                          ? t("addProvider.rankingEnabled")
                          : t("addProvider.rankingDisabled")}
                      </label>
                    </div>
                  </div>

                  {values.is_ranked && (
                    <div className="d-flex flex-column gap-3 mt-3">
                      <FormField
                        label={t("addProvider.rankingPosition")}
                        required
                        errorName="ranking_position"
                      >
                        <Field
                          type="number"
                          min="1"
                          step="1"
                          name="ranking_position"
                          className="form-control"
                          placeholder={t("addProvider.rankingPositionPlaceholder")}
                        />
                      </FormField>

                      <FormField
                        label={t("addProvider.rankBadgeLabel")}
                        errorName="rank_badge_label"
                      >
                        <Field
                          type="text"
                          name="rank_badge_label"
                          className="form-control"
                          placeholder={t("addProvider.rankBadgeLabelPlaceholder")}
                        />
                      </FormField>

                      <FormField
                        label={t("addProvider.rankingStartAt")}
                        errorName="ranking_start_at"
                      >
                        <Field
                          type="datetime-local"
                          name="ranking_start_at"
                          className="form-control"
                        />
                      </FormField>

                      <FormField
                        label={t("addProvider.rankingEndAt")}
                        errorName="ranking_end_at"
                      >
                        <Field
                          type="datetime-local"
                          name="ranking_end_at"
                          className="form-control"
                        />
                      </FormField>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-end">
                <Button
                  btnText={
                    isUpdate
                      ? t("addProvider.updateButton")
                      : t("addProvider.addButton")
                  }
                  btnStyle="PD"
                  onClick={submitForm}
                  btnLoading={btnLoading}
                />
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default ProviderModal;
