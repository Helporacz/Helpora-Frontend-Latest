import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiLogIn,
  FiMapPin,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import "./Register.scss";
import { userRegister, throwSuccess, throwError } from "store/globalSlice";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";
import { commonRoute } from "utils/constants";
import { MdOutlineLocationCity } from "react-icons/md";
import regionsEn from "./regions_en.json";
import regionsCz from "./regions_cz.json";

const USER_ROLE = "user";
const PROVIDER_ROLE = "provider";
const CUSTOM_DISTRICT_VALUE = "__custom";

const Register = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [allRegions, setAllRegions] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);

  const mappedRegions = useMemo(() => {
    const dataset =
      (i18n.language || "").toLowerCase().startsWith("en")
        ? regionsEn
        : regionsCz;

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
    setAllRegions(mappedRegions);
    setFilteredCities([]);
    setFilteredDistricts([]);
  }, [mappedRegions]);

  const filterCitiesByRegion = (regionIdOrName) => {
    const region =
      allRegions.find((entry) => entry._id === regionIdOrName) ||
      allRegions.find((entry) => entry.nameEn === regionIdOrName);
    setFilteredCities(region ? region.cities : []);
  };

  const filterDistrictsByCity = (cityIdOrName) => {
    const sourceCities =
      filteredCities.length > 0
        ? filteredCities
        : allRegions.flatMap((entry) => entry.cities || []);

    const city =
      sourceCities.find((entry) => entry._id === cityIdOrName) ||
      sourceCities.find((entry) => entry.nameEn === cityIdOrName);
    setFilteredDistricts(city ? city.districts : []);
  };

  const registerSchema = useMemo(
    () =>
      Yup.object()
        .shape({
          name: Yup.string().required(t("section26.text1")),
          email: Yup.string()
            .trim()
            .required(t("section26.text4"))
            .matches(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              t("section26.text2")
            ),
          password: Yup.string()
            .min(6, t("section26.text3"))
            .required(t("section26.text5")),
          role: Yup.string()
            .oneOf([USER_ROLE, PROVIDER_ROLE], t("section20.selectRole", "Please choose a role"))
            .required(t("section20.selectRole", "Please choose a role")),
          region: Yup.string().when("role", {
            is: PROVIDER_ROLE,
            then: (schema) => schema.required(t("section20.text17")),
            otherwise: (schema) => schema.nullable(),
          }),
          city: Yup.string().when("role", {
            is: PROVIDER_ROLE,
            then: (schema) => schema.required(t("section20.text18")),
            otherwise: (schema) => schema.nullable(),
          }),
          district: Yup.string().nullable(),
          customDistrict: Yup.string().when(["role", "district"], {
            is: (role, district) =>
              role === PROVIDER_ROLE && district === CUSTOM_DISTRICT_VALUE,
            then: (schema) =>
              schema
                .trim()
                .required(
                  t("section20.districtRequired", "Please enter your district")
                ),
            otherwise: (schema) => schema.nullable(),
          }),
          address: Yup.string().when("role", {
            is: PROVIDER_ROLE,
            then: (schema) =>
              schema
                .trim()
                .required(
                  t("section20.addressRequired", "Address is required")
                ),
            otherwise: (schema) => schema.nullable(),
          }),
          termsAccepted: Yup.boolean().when("role", {
            is: PROVIDER_ROLE,
            then: (schema) =>
              schema
                .oneOf([true], t("section20.text13"))
                .required(t("section20.text13")),
            otherwise: (schema) => schema.notRequired(),
          }),
          privacyAccepted: Yup.boolean()
            .oneOf([true], t("section20.text15"))
            .required(t("section20.text15")),
        })
        .test(
          "district-or-custom",
          t("section20.districtRequired", "Please choose a district"),
          (values) => {
            if (!values || values.role !== PROVIDER_ROLE) {
              return true;
            }

            if (values.district === CUSTOM_DISTRICT_VALUE) {
              return Boolean(String(values.customDistrict || "").trim());
            }

            return Boolean(values.district);
          }
        ),
    [t]
  );

  const initialValues = {
    name: "",
    email: "",
    password: "",
    role: "",
    region: "",
    city: "",
    district: "",
    customDistrict: "",
    address: "",
    termsAccepted: false,
    termsVersion: "v1",
    privacyAccepted: false,
    privacyVersion: "v1",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values };
      const isProviderSignup = payload.role === PROVIDER_ROLE;

      if (isProviderSignup) {
        const regionObj =
          allRegions.find((entry) => entry._id === payload.region) ||
          allRegions.find((entry) => entry.nameEn === payload.region);
        const cityObj =
          regionObj?.cities.find(
            (entry) => entry._id === payload.city || entry.nameEn === payload.city
          ) ||
          filteredCities.find(
            (entry) => entry._id === payload.city || entry.nameEn === payload.city
          );
        const districtObj =
          cityObj?.districts.find(
            (entry) =>
              entry._id === payload.district || entry.nameEn === payload.district
          ) ||
          filteredDistricts.find(
            (entry) =>
              entry._id === payload.district || entry.nameEn === payload.district
          );

        const customDistrict = String(payload.customDistrict || "").trim();

        payload.regionId = regionObj?._id || payload.region;
        payload.cityId = cityObj?._id || payload.city;
        payload.districtId = customDistrict
          ? "custom"
          : districtObj?._id || payload.district;

        payload.region = regionObj?.nameEn || payload.region;
        payload.city = cityObj?.nameEn || payload.city;
        payload.district =
          customDistrict || districtObj?.nameEn || payload.district;
        payload.address = String(payload.address || "").trim();
      } else {
        payload.role = USER_ROLE;
        payload.termsAccepted = false;
        delete payload.region;
        delete payload.city;
        delete payload.district;
        delete payload.customDistrict;
        delete payload.regionId;
        delete payload.cityId;
        delete payload.districtId;
        delete payload.address;
      }

      delete payload.customDistrict;

      const response = await dispatch(userRegister(payload));
      if (response?.status === 200) {
        dispatch(throwSuccess(t("section26.text6")));
        navigate(getLocalizedPath("/login", i18n.language));
      } else {
        dispatch(throwError(response?.message || t("section26.text7")));
      }
    } catch (error) {
      dispatch(throwError(t("section26.text8")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="background-animation">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="register-card">
              <div className="register-header">
                <div className="logo-section">
                  <div className="logo-icon">
                    <HiSparkles />
                  </div>
                  <h1 className="brand-name">{t("section20.text1")}</h1>
                </div>
                <div className="welcome-text">
                  <h2>{t("section20.text2")}</h2>
                  <p>{t("section20.text3")}</p>
                </div>
              </div>

              <div className="register-form-section">
                <Formik
                  initialValues={initialValues}
                  validationSchema={registerSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, values, setFieldValue }) => {
                    const isProviderSignup = values.role === PROVIDER_ROLE;
                    const customDistrictValue = String(values.customDistrict || "").trim();
                    const hasDistrict =
                      values.district === CUSTOM_DISTRICT_VALUE
                        ? Boolean(customDistrictValue)
                        : Boolean(values.district);
                    const hasProviderRequirements =
                      !isProviderSignup ||
                      (Boolean(values.region) &&
                        Boolean(values.city) &&
                        hasDistrict &&
                        Boolean(String(values.address || "").trim()) &&
                        values.termsAccepted);
                    const canSubmit =
                      Boolean(values.name) &&
                      Boolean(values.email) &&
                      Boolean(values.password) &&
                      Boolean(values.role) &&
                      values.privacyAccepted &&
                      hasProviderRequirements;

                    return (
                      <Form>
                        <div className="form-group">
                          <label className="form-label">
                            {t("section20.primaryRole", "Primary role")}
                          </label>
                          <div className="role-selector">
                            <label
                              className={`role-option ${
                                values.role === PROVIDER_ROLE ? "active" : ""
                              }`}
                            >
                              <Field
                                type="radio"
                                name="role"
                                value={PROVIDER_ROLE}
                                onChange={() => setFieldValue("role", PROVIDER_ROLE)}
                              />
                              <span>
                                {t("section20.providerRole", "Provider")}
                              </span>
                            </label>
                            <label
                              className={`role-option ${
                                values.role === USER_ROLE ? "active" : ""
                              }`}
                            >
                              <Field
                                type="radio"
                                name="role"
                                value={USER_ROLE}
                                onChange={() => {
                                  setFieldValue("role", USER_ROLE);
                                  setFieldValue("region", "");
                                  setFieldValue("city", "");
                                  setFieldValue("district", "");
                                  setFieldValue("customDistrict", "");
                                  setFieldValue("address", "");
                                  setFieldValue("termsAccepted", false);
                                  setFilteredCities([]);
                                  setFilteredDistricts([]);
                                }}
                              />
                              <span>{t("section20.buyerRole", "User")}</span>
                            </label>
                          </div>
                          <ErrorMessage
                            name="role"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            <FiUser className="label-icon" />
                            {t("section20.text4")}
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="text"
                              id="name"
                              name="name"
                              placeholder={t("section36.text1")}
                              className="form-control"
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            <FiMail className="label-icon" /> {t("section20.text5")}
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="email"
                              id="email"
                              name="email"
                              placeholder="your.email@example.com"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="password" className="form-label">
                            <FiLock className="label-icon" />
                            {t("section20.text6")}
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              id="password"
                              name="password"
                              placeholder={t("section36.text2")}
                              className="form-control"
                            />
                            <ErrorMessage
                              name="password"
                              component="div"
                              className="invalid-feedback d-block"
                            />
                          </div>
                        </div>

                        {isProviderSignup && (
                          <>
                            <div className="form-group">
                              <label className="form-label">
                                <MdOutlineLocationCity className="label-icon" />
                                {t("section20.regions")}
                              </label>
                              <div className="input-wrapper">
                                <Field
                                  as="select"
                                  name="region"
                                  className="form-control"
                                  onChange={(e) => {
                                    const regionValue = e.target.value;
                                    setFieldValue("region", regionValue);
                                    setFieldValue("city", "");
                                    setFieldValue("district", "");
                                    setFieldValue("customDistrict", "");
                                    filterCitiesByRegion(regionValue);
                                    setFilteredDistricts([]);
                                  }}
                                >
                                  <option value="">{t("section20.text17")}</option>
                                  {allRegions.map((region) => (
                                    <option key={region._id} value={region._id}>
                                      {region.nameEn}
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage
                                  name="region"
                                  component="div"
                                  className="invalid-feedback d-block"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="form-label">
                                <MdOutlineLocationCity className="label-icon" />
                                {t("section20.city")}
                              </label>
                              <div className="input-wrapper">
                                <Field
                                  as="select"
                                  name="city"
                                  className="form-control"
                                  disabled={!values.region}
                                  onChange={(e) => {
                                    const cityValue = e.target.value;
                                    setFieldValue("city", cityValue);
                                    setFieldValue("district", "");
                                    setFieldValue("customDistrict", "");
                                    filterDistrictsByCity(cityValue);
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
                                    <option key={city._id} value={city._id}>
                                      {city.nameEn}
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage
                                  name="city"
                                  component="div"
                                  className="invalid-feedback d-block"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="form-label">
                                <MdOutlineLocationCity className="label-icon" />
                                {t("section20.district")}
                              </label>
                              <div className="input-wrapper">
                                <Field
                                  as="select"
                                  name="district"
                                  className="form-control"
                                  disabled={!values.city}
                                  onChange={(e) => {
                                    const districtValue = e.target.value;
                                    setFieldValue("district", districtValue);
                                    if (districtValue !== CUSTOM_DISTRICT_VALUE) {
                                      setFieldValue("customDistrict", "");
                                    }
                                  }}
                                >
                                  <option value="">
                                    {!values.city
                                      ? "Select City First"
                                      : filteredDistricts.length === 0
                                      ? "No districts available"
                                      : "Select District"}
                                  </option>
                                  {filteredDistricts.map((district) => (
                                    <option key={district._id} value={district._id}>
                                      {district.nameEn}
                                    </option>
                                  ))}
                                  <option value={CUSTOM_DISTRICT_VALUE}>
                                    Other / enter manually
                                  </option>
                                </Field>
                                <ErrorMessage
                                  name="district"
                                  component="div"
                                  className="invalid-feedback d-block"
                                />
                              </div>
                            </div>

                            {values.district === CUSTOM_DISTRICT_VALUE && (
                              <div className="form-group">
                                <label className="form-label">
                                  <MdOutlineLocationCity className="label-icon" />
                                  {t("section20.district")} - {t("section20.text10")}
                                </label>
                                <div className="input-wrapper">
                                  <Field
                                    type="text"
                                    name="customDistrict"
                                    className="form-control"
                                    placeholder="Type your district"
                                  />
                                  <ErrorMessage
                                    name="customDistrict"
                                    component="div"
                                    className="invalid-feedback d-block"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="form-group">
                              <label htmlFor="address" className="form-label">
                                <FiMapPin className="label-icon" />
                                {t("section20.address", "Address")}
                              </label>
                              <div className="input-wrapper">
                                <Field
                                  type="text"
                                  id="address"
                                  name="address"
                                  placeholder={t(
                                    "section20.addressPlaceholder",
                                    "Street, house number, area"
                                  )}
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name="address"
                                  component="div"
                                  className="invalid-feedback d-block"
                                />
                              </div>
                            </div>

                            <div className="form-group terms-check">
                              <label className="terms-label">
                                <Field type="checkbox" name="termsAccepted" />
                                <span>{t("section20.text12")}</span>
                                <span
                                  className="terms-link"
                                  onClick={() =>
                                    navigate(
                                      getLocalizedPath(commonRoute.terms, i18n.language)
                                    )
                                  }
                                >
                                  {t("section20.text14")}
                                </span>
                              </label>
                              <ErrorMessage
                                name="termsAccepted"
                                component="div"
                                className="invalid-feedback d-block"
                              />
                            </div>
                          </>
                        )}

                        <div className="form-group terms-check">
                          <label className="terms-label">
                            <Field type="checkbox" name="privacyAccepted" />
                            <span>{t("section20.text15")}</span>
                            <span
                              className="terms-link"
                              onClick={() =>
                                navigate(
                                  getLocalizedPath(commonRoute.privacy, i18n.language)
                                )
                              }
                            >
                              {t("section20.text16")}
                            </span>
                          </label>
                          <ErrorMessage
                            name="privacyAccepted"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>

                        <div className="sign-in-link">
                          <span>{t("section20.text7")} </span>
                          <span
                            className="link-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(getLocalizedPath("/login", i18n.language))
                            }
                          >
                            <FiLogIn className="me-1" />
                            {t("section20.text8")}
                          </span>
                        </div>

                        <button
                          type="submit"
                          className={`btn1 btn-submit ${
                            isSubmitting ? "loading" : ""
                          }`}
                          disabled={isSubmitting || !canSubmit}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t("section20.text9")}
                            </>
                          ) : (
                            <>
                              {t("section20.text10")}
                              <FiArrowRight className="ms-2" />
                            </>
                          )}
                        </button>
                      </Form>
                    );
                  }}
                </Formik>
              </div>

              <div className="register-footer">
                <p>{t("section20.text11")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
