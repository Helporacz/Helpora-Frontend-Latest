import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight, FiLogIn } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import "./Register.scss";
import {
  userRegister,
  throwSuccess,
  throwError,
} from "store/globalSlice";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";
import { commonRoute } from "utils/constants";
import { MdOutlineLocationCity } from "react-icons/md";
import regionsEn from "./regions_en.json";
import regionsCz from "./regions_cz.json";

const Register = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [allRegions, setAllRegions] = useState([]);
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
    setAllRegions(mappedRegions);
    setFilteredCities([]);
    setFilteredDistricts([]);
  }, [mappedRegions]);

  const filterCitiesByRegion = (regionIdOrName) => {
    const region =
      allRegions.find((r) => r._id === regionIdOrName) ||
      allRegions.find((r) => r.nameEn === regionIdOrName);
    setFilteredCities(region ? region.cities : []);
  };

  const filterDistrictsByCity = (cityIdOrName) => {
    const sourceCities =
      filteredCities.length > 0 ? filteredCities : allRegions.flatMap((r) => r.cities || []);
    const city =
      sourceCities.find((c) => c._id === cityIdOrName) ||
      sourceCities.find((c) => c.nameEn === cityIdOrName);
    setFilteredDistricts(city ? city.districts : []);
  };

const registerSchema = Yup.object().shape({
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
  termsAccepted: Yup.boolean()
    .oneOf([true], t("section20.text13"))
    .required(t("section20.text13")),
  privacyAccepted: Yup.boolean()
    .oneOf([true], t("section20.text15"))
    .required(t("section20.text15")),
  region: Yup.string().required(t("section20.text17")),
  city: Yup.string().required(t("section20.text18")),
  district: Yup.string().nullable(),
  customDistrict: Yup.string().nullable(),
}).test(
  "district-or-custom",
  t("District id require"),
  (values) => !!(values.district || values.customDistrict)
);

const initialValues = {
  name: "",
  email: "",
  password: "",
  region: "",
  city: "",
  district: "",
  customDistrict: "",
  role: "provider",
  termsAccepted: false,
  termsVersion: "v1",
  privacyAccepted: false,
  privacyVersion: "v1",
};

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values };
      const regionObj =
        allRegions.find((r) => r._id === payload.region) ||
        allRegions.find((r) => r.nameEn === payload.region);
      const cityObj =
        regionObj?.cities.find(
          (c) => c._id === payload.city || c.nameEn === payload.city
        ) || filteredCities.find((c) => c._id === payload.city || c.nameEn === payload.city);
      const districtObj =
        cityObj?.districts.find(
          (d) => d._id === payload.district || d.nameEn === payload.district
        ) ||
        filteredDistricts.find(
          (d) => d._id === payload.district || d.nameEn === payload.district
        );

      const customDistrict = payload.customDistrict?.trim();

      payload.regionId = regionObj?._id || payload.region;
      payload.cityId = cityObj?._id || payload.city;
      payload.districtId = customDistrict ? "custom" : districtObj?._id || payload.district;
      payload.region = regionObj?.nameEn || payload.region;
      payload.city = cityObj?.nameEn || payload.city;
      payload.district = customDistrict || districtObj?.nameEn || payload.district;
      delete payload.customDistrict;
      
      const response = await dispatch(userRegister(payload));
      if (response?.status === 200) {
        dispatch(throwSuccess(t("section26.text6")));
        navigate(getLocalizedPath("/login", i18n.language));
      } else {
        dispatch(throwError(t("section26.text7")));
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
                  {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
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
                          <FiMail className="label-icon" />{" "}
                          {t("section20.text5")}
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

                      {/* Region Select */}
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

                              // Filter cities by selected region
                              filterCitiesByRegion(regionValue);
                              setFilteredDistricts([]); // Clear districts when region changes
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

                      {/* City Select */}
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

                              // Filter districts by selected city
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

                      {/* District Select */}
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
                            onChange={(e) => setFieldValue("district", e.target.value)}
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
                            <option value="__custom">Other / enter manually</option>
                          </Field>
                          <ErrorMessage
                            name="district"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>
                      </div>

                      {values.district === "__custom" && (
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

                      <div className="form-group terms-check">
                        <label className="terms-label">
                          <Field type="checkbox" name="termsAccepted" />
                          <span>{t("section20.text12")}</span>
                          <span
                            className="terms-link"
                            onClick={() =>
                              navigate(
                                getLocalizedPath(
                                  commonRoute.terms,
                                  i18n.language
                                )
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

                      <div className="form-group terms-check">
                        <label className="terms-label">
                          <Field type="checkbox" name="privacyAccepted" />
                          <span>{t("section20.text15")}</span>
                          <span
                            className="terms-link"
                            onClick={() =>
                              navigate(
                                getLocalizedPath(
                                  commonRoute.privacy,
                                  i18n.language
                                )
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

                      <button
                        type="submit"
                        className={`btn1 btn-submit ${
                          isSubmitting ? "loading" : ""
                        }`}
                        disabled={
                          isSubmitting ||
                          !values.name ||
                          !values.email ||
                          !values.password ||
                          !values.region ||
                          !values.city ||
                          !values.district ||
                          !values.termsAccepted ||
                          !values.privacyAccepted
                        }
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
                  )}
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
