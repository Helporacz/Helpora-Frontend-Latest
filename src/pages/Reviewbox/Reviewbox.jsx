import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import "./Reviewbox.scss";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getAllReview } from "store/globalSlice";
import avatartMale from "../../assets/images/Screenshot_2.png";
import avatartFemale from "../../assets/images/Screenshot_3.png";

const Reviewbox = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentLang = i18n.language === "cz" ? "cz" : "en";

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dispatch(getAllReview());
      const reviewsData = response?.reviews || [];
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, currentLang]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <section className="review-container">
      <div className="container ">
        <div className="review-heading">
          <h5 className="title">{t("section4.text1")}</h5>
          <p className="review-description">{t("section4.text2")}</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-5">
            <p>No reviews available</p>
          </div>
        ) : (
          <div className="review-grid">
            {reviews.map((item) => {
                const isCz = currentLang === "cz";

              const displayName = isCz
                ? item.cz_name || item.name
                : item.name || "Anonymous";
              const displayComment = isCz
                ? item.cz_comment || item.comment
                : item.comment || "";
              const displayService = isCz
                ? item.service?.cz_title || item.service?.title
                : item.service?.title || "";
              const displayImage =
                item.profileImage ||
                (parseInt(item._id.slice(-1), 16) % 2 === 0
                  ? avatartMale
                  : avatartFemale);
              const displayRating = item.rating || 0;

              return (
                <div className="review-card" key={item._id}>
                  <div className="card-header">
                    <img
                      src={displayImage}
                      alt={displayName}
                      className="avatar-img"
                      onError={(e) => {
                        e.target.src =
                          item._id % 2 === 0 ? avatartMale : avatartFemale;
                      }}
                    />
                    <div className="info-group">
                      <h3 className="user-name">{displayName}</h3>
                      {displayService && (
                        <p className="address">{displayService}</p>
                      )}
                    </div>
                  </div>

                  <div className="review-card-body">
                    {/* Stars group */}
                    <div className="stars">
                      {[...Array(Math.min(displayRating, 5))].map((_, i) => (
                        <FaStar key={i} color="#22bf1e" />
                      ))}
                    </div>

                    {displayComment && (
                      <p className="review-text">"{displayComment}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviewbox;
