import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./AsSeenIn.scss";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

const AsSeenIn = () => {
  const logos = [
    {
      id: 1,
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
      alt: "Apple",
    },
    {
      id: 2,
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      alt: "Google",
    },
    {
      id: 3,
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      alt: "Amazon",
    },
    {
      id: 4,
      src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      alt: "Microsoft",
    },
    {
      id: 5,
      src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      alt: "Netflix",
    },
    {
      id: 6,
      src: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
      alt: "Spotify",
    },
  ];

  return (
    <section className="as-seen-section py-5">
      <div className="container text-center">
        <div className="section-header mb-4">
          <h2 className="fw-bold settitle">As Seen In</h2>
          <p className="text-muted">Trusted by the world’s leading companies</p>
        </div>

        <Swiper
          slidesPerView={2}
          spaceBetween={15}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          breakpoints={{
            576: { slidesPerView: 3, spaceBetween: 20 },
            768: { slidesPerView: 4, spaceBetween: 25 },
            1024: { slidesPerView: 5, spaceBetween: 30 },
          }}
          modules={[Autoplay]}
          className="mySwiper py-3"
        >
          {[...logos, ...logos].map((logo, index) => (
            <SwiperSlide key={index}>
              <div className="logo-wrapper shadow-sm p-3 rounded bg-white">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="logo-image"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* <div className="testimonial mt-5 p-4 p-md-5 bg-light rounded">
          <FaQuoteLeft className="quote-icon text-primary" />
          <p className="testimonial-text my-3">
            "Our platform is trusted by the biggest brands in the world.
            Experience seamless integration and cutting-edge performance."
          </p>
          <FaQuoteRight className="quote-icon text-primary" />
          <h6 className="fw-bold mt-3">— Jane Doe, CEO</h6>
        </div> */}
      </div>
    </section>
  );
};

export default AsSeenIn;
