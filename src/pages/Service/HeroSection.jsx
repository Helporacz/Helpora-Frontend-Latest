import Carousel from "react-bootstrap/Carousel";
import "./HeroSection.css";

const heroImages = [
  "https://images.unsplash.com/photo-1617048530929-0edab8608369?q=80&w=1173&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1661928892545-3e0eef58c96b?q=80&w=1170&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1661884973994-d7625e52631a?w=500&auto=format&fit=crop&q=60",
];

const HeroSection = () => {

  return (
    <div className="hero-wrapper">
      <Carousel>
        {heroImages.map((img, index) => (
          <Carousel.Item key={index}>
            <div
              className="hero-section-dynamic"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0,0,0,0.5)), url(${img})`,
              }}
            >
              <div className="hero-overlay">
                <div className="container text-center hero-content">
                  <h1 className="hero-title">
                    <span className="highlight ">
                      Your Local Services Marketplace
                    </span>
                    <br />
                    One Platform, All Services <br /> surroundings
                  </h1>

                  <div className="d-flex justify-content-center">
                    <div
                      className="hero-search d-flex justify-content-center"
                      style={{ width: "50%" }}
                    >
                      <input
                        type="text"
                        className="form-control hero-input"
                        placeholder="Where do you need services?"
                      />
                      <button className="btn btn-success hero-btn">Search</button>
                    </div>
                  </div>

                  <div
                    className="d-flex justify-content-center flex-column"
                    style={{ marginTop: "20px" }}
                  >
                    <p style={{ fontSize: "20px", color: "white", fontFamily:"'League Spartan'" }}>
                      Most Popular Searches
                    </p>

                    <div
                      className="popular-tags d-flex flex-wrap justify-content-center"
                      style={{ width: "70%", margin: "0 auto" }}
                    >
                      {[
                        "Praha",
                        "Brno",
                        "Ostrava",
                        "Plzeň",
                        "Liberec",
                        "Olomouc",
                        "České Budějovice",
                        "Hradec Králové",
                        "Pardubice",
                        "Ústí nad Labem",
                        "Zlín",
                      ].map((city, i) => (
                        <span key={i} className="tag">
                          <i className="bi bi-geo-alt-fill"></i> {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroSection;
