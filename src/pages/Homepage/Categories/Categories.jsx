import SkeletonCategory from "components/Skeleton/SkeletonCategory";
import LazyBackgroundImage from "components/LazyBackgroundImage";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowRight } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllCategory } from "store/globalSlice";
import { getLocalizedPath } from "utils/localizedRoute";
import clean from "../../../assets/images/clean.jpg";
import "./Categories.scss";

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  const normalizedLang = (i18n.resolvedLanguage || i18n.language || "en")
    .toLowerCase()
    .split("-")[0];
  const currentLang = normalizedLang === "cs" ? "cz" : normalizedLang;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dispatch(getAllCategory());
      let services = response?.data || [];
      setCategories(services);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(t("errors.loadCategories"));
    } finally {
      setLoading(false);
    }
  }, [dispatch, currentLang, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getImageForCategory = () => clean;

  const slugify = (text = "") =>
    String(text)
      .normalize("NFKD")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  if (loading) {
    return <SkeletonCategory />;
  }
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <section className="categories-section py-3 py-md-5 py-lg-7">
      <div className="container">
        <div className="text-center mb-5 mb-lg-6 position-relative">
          <h3 className="display-4 fw-bold gradient-text mb-3 animate-fade-in">
            {t("section2.text1")}
          </h3>
          <p className="lead text-muted max-w-650 mx-auto mb-4">
            {t("section2.text2")}
          </p>
          <div className="header-underline mx-auto"></div>
        </div>

        <div className="row g-4">
          {categories.map((category, index) => {
            const backgroundImage = category.image || getImageForCategory();

            const displayName =
              (currentLang === "ru"
                ? category?.ru_name
                : currentLang === "cz"
                ? category?.cz_name
                : category?.name) ||
              category?.name ||
              category?.cz_name ||
              category?.ru_name ||
              "";

            const displayDescription =
              (currentLang === "ru"
                ? category?.ru_short_description
                : currentLang === "cz"
                ? category?.cz_short_description
                : category?.short_description) ||
              category?.short_description ||
              category?.cz_short_description ||
              category?.ru_short_description ||
              "";

            const slugSource = displayName || "";

            const count = Number(category?.serviceCount || 0);

            return (
              <div
                key={category._id}
                className=" col-sm-6 col-lg-4 col-xl-3"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="category-card-modern position-relative overflow-hidden rounded-4 shadow-hover cursor-pointer h-100"
                  onClick={() => {
                    if (count > 0) {
                      navigate(
                        getLocalizedPath(
                          `/categories/${slugify(slugSource)}/${category._id}`,
                          i18n.language
                        )
                      );
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  <LazyBackgroundImage
                    className="card-bg"
                    src={backgroundImage}
                    style={{
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />

                  <div className="card-overlay"></div>
                  <div className="card-border"></div>

                  <div className="card-content-modern px-4 pt-4 d-flex flex-column justify-content-end h-100 position-relative">
                    <h3 className="category-title-modern fw-bold text-white">
                      {displayName}
                    </h3>

                    {displayDescription && (
                      <p className="category-description text-white-50 mb-3 small">
                        {displayDescription}
                      </p>
                    )}

                    <div className="explore-link-modern d-flex align-items-center justify-content-center gap-2">
                      <span className="fw-semibold text-white">
                        {t("section2.text3")}
                      </span>
                      <FaArrowRight className="arrow-icon-modern" size={16} />
                    </div>

                    <p className="text-white d-flex justify-content-center pt-1">
                      {count > 0
                        ? `${count} ${t("common.services")}`
                        : t("common.currentlyAvailable")}
                    </p>
                  </div>

                  <div className="particle particle-1"></div>
                  <div className="particle particle-2"></div>
                  <div className="particle particle-3"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
