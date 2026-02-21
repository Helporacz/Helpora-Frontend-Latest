import React, { useState } from "react";
import "./SittersSection.scss"; // now .scss
import { IoMdPlay } from "react-icons/io";
import { getDataFromLocalStorage } from "utils/helpers";
import { useNavigate } from "react-router-dom";

// Helper to extract YouTube ID from any YouTube URL (shorts, regular, etc.)
const extractYouTubeId = (url) => {
  if (!url) return "";
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : "";
};

const SittersSection = () => {
  const sitters = [
    {
      id: 1,
      name: "Petr H.",
      experience: "18 years experience in tutoring",
      videoUrl: "https://www.youtube.com/shorts/DtlGm_9jE5k?feature=share",
      thumbnail:
        "https://hlidackycz-production-assets.imgix.net/assets/design/landings/sitters_onboarding/testimonial-video-alois-89462070f3193332b68022b437b3ee926965540f7b58b05d6d1f5908f953bbe6.png?ixlib=rails-4.3.1&width=234&dpr=3&fit=max&auto=format%2Ccompress&s=ac875d846099fd387d265dee602f92e6",
      profileLink: "#",
    },
    {
      id: 2,
      name: "Markéta Z.",
      experience: "4 years experience in beauty & care",
      videoUrl: "https://youtube.com/shorts/IC9g-DCrxis?feature=share",
      thumbnail:
        "https://hlidackycz-production-assets.imgix.net/assets/design/landings/sitters_onboarding/testimonial-video-marketa-f4a89ede2c73a6a6aced69f446858d908d0d83b23fba6f54f687cd1400402f18.png?ixlib=rails-4.3.1&width=234&dpr=3&fit=max&auto=format%2Ccompress&s=2f674125f3aeaf21e6a4c18ac3d4375e",
      profileLink: "#",
    },
    {
      id: 3,
      name: "Žaneta P.",
      experience: "10 years experience in facials",
      videoUrl: "https://youtube.com/shorts/LBDml5XkLKE?feature=share",
      thumbnail:
        "https://hlidackycz-production-assets.imgix.net/assets/design/landings/sitters_onboarding/testimonial-video-zanda-6cee506f2354968568d8f101cadcba4412b1eccee72027360469136ac032ce6c.png?ixlib=rails-4.3.1&width=234&dpr=3&fit=max&auto=format%2Ccompress&s=17aca8055173bf3aff189f7696f8590f",
      profileLink: "#",
    },
    {
      id: 4,
      name: "Rosemarie Č.",
      experience: "4 years experience in massage",
      videoUrl: "https://youtube.com/shorts/dfDp8MqPEb0?feature=share",
      thumbnail:
        "https://hlidackycz-production-assets.imgix.net/assets/design/landings/sitters_onboarding/testimonial-video-rosemary-e50591ce6cb841e84d9a839993eb04b4730c437a253c63f4f4b955b66452ed05.png?ixlib=rails-4.3.1&width=234&dpr=3&fit=max&auto=format%2Ccompress&s=e93d4db0989d73a0edfea7958ffb8b9d",
      profileLink: "#",
    },
  ];

  const token = getDataFromLocalStorage("token");
  const [playingVideo, setPlayingVideo] = useState(null);
  const navigate = useNavigate();

  return (
    <section className="sitters-section">
      <div className="container">
        {/* Heading */}
        <div className="text-center mb-5 pb-4">
          <h1 className="display-5 fw-bold text-dark mb-4">
            What does caring mean to our tutors?
          </h1>
          <p className="lead text-muted col-lg-8 mx-auto">
            Hear directly from the people who make a difference every day. 
            Connect with tutors whose values and passion align with your family.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="row g-4 justify-content-center">
          {sitters.map((sitter) => {
            const videoId = extractYouTubeId(sitter.videoUrl);

            return (
              <div key={sitter.id} className="col-lg-3 col-md-6">
                <article className="sitter-card">
                  <div className="video-wrapper">
                    {playingVideo === sitter.id ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                        title={sitter.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div
                        className="thumbnail"
                        onClick={() => setPlayingVideo(sitter.id)}
                      >
                        <img src={sitter.thumbnail} alt={sitter.name} />
                        <div className="play-btn">
                          <IoMdPlay />
                        </div>
                        <div className="overlay"></div>
                      </div>
                    )}
                  </div>

                  <div className="sitter-info">
                    <h5>{sitter.name}</h5>
                    <p className="experience">{sitter.experience}</p>
                    <a href={sitter.profileLink} className="view-profile">
                      View profile →
                    </a>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {!token && (
          <div className="text-center mt-5">
            <button
              className="btn-cta"
              onClick={() => navigate("/register")}
            >
              Sign up to find your perfect match
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SittersSection;