import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAllCategory } from "store/globalSlice";
import clean from "../../assets/images/clean.jpg";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import SkeletonCategory from "components/Skeleton/SkeletonCategory";
import { useTranslation } from "react-i18next";
import { getLocalizedPath } from "utils/localizedRoute";

const Servicesection = () => {
  const { t, i18n } = useTranslation();
  const normalizedLang = (i18n.resolvedLanguage || i18n.language || "en")
    .toLowerCase()
    .split("-")[0];
  const currentLang = normalizedLang === "cs" ? "cz" : normalizedLang;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await dispatch(getAllCategory());
        const services = response?.data || [];
        setCategories(services);
      } catch (error) {
        console.error(t("section41.text1"), error);
        setError(t("section41.text2"));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [dispatch]);

  const getImageForCategory = (name) => {
    if (!name) return clean;
    return clean;
  };

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
    <section id="service" className="services-section">
      <div className="container">
        <div className="services-header">
          <h1
            className="main-heading"
            style={{
              background: "linear-gradient(135deg, #22bf1e 0%, #00ffc8 100%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("section6.text1")}
            <span
              className="gradient-text"
              style={{
                background:
                  "linear-gradient(135deg, rgb(33, 190, 29) 0%, rgb(0, 208, 132) 50%, rgb(0, 255, 200) 100%)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {" "}
              {t("section6.text2")}
            </span>
          </h1>

          <p className="sub-heading">{t("section6.text3")}</p>
          <div
            className="decorative-line"
            style={{
              background:
                "linear-gradient(135deg, rgb(33, 190, 29) 0%, rgb(0, 208, 132) 50%, rgb(0, 255, 200) 100%)",
            }}
          ></div>
        </div>

        <div className="row g-4">
          {categories.map((category, index) => {
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
            return (
              <div key={category._id} className="col-lg-4 col-md-6">
                <div
                  className="service-card-modern"
                  // onClick={() =>
                  //   navigate(
                  //     getLocalizedPath(
                  //       `/categories/${slugify(slugSource)}/${category._id}`,
                  //       i18n.language
                  //     )
                  //   )
                  // }
                  onClick={() => {
                    if (category?.serviceCount > 0) {
                      navigate(
                        getLocalizedPath(
                          `/categories/${slugify(slugSource)}/${category._id}`,
                          i18n.language
                        )
                      );
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-glow-effect"></div>
                  <div className="card-image-wrapper">
                    <div className="image-overlay-gradient"></div>
                    <img
                      src={category.image || getImageForCategory(category.name)}
                      alt={category.name}
                      className="card-image"
                    />
                  </div>

                  <div className="card-body-content">
                  <div className="d-flex justify-content-between align-content-center ">
                      <h3 className="card-title">{displayName}</h3>  <h6 className="">{category?.serviceCount} {t("common.services")}</h6>
                  </div>

                    <p className="card-description">{displayDescription}</p>
                   
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          getLocalizedPath(
                            `/categories/${slugify(displayName || category.name)}/${
                              category._id
                            }`,
                            i18n.language
                          )
                        );
                      }}
                      className="action-button"
                    >
                      <span className="button-text">{t("section6.text4")}</span>
                      <div className="button-icon-wrapper">
                        <FaArrowRight className="arrow-icon" />
                      </div>
                      <div className="button-shine"></div>
                    </button>
                  </div>

                  <div className="card-bottom-decoration"></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bottom-cta">
          <div className="cta-content">
            <h3>{t("section6.text5")}</h3>
            <p>{t("section6.text6")}</p>
            <button
              onClick={() =>
                navigate(getLocalizedPath("/contact", i18n.language))
              }
              className="cta-button"
            >
              {t("section6.text7")}
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-decoration decoration-1"></div>
      <div className="bg-decoration decoration-2"></div>
      <div className="bg-decoration decoration-3"></div>
    </section>
  );
};

export default Servicesection;
