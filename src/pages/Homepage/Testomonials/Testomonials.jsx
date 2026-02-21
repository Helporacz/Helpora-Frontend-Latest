import React from "react";
import "./Testomonials.scss";

const Testomonials = () => {
  return (
    <>
      <div className="testimonial">
        <h1 style={{ textAlign: "center", marginTop: "20px",fontWeight:"700" }}>Testimonials</h1>
        <hr style={{ width: "40%", margin: "10px auto" }} />
        <div className="small-container">
          <div className="row">
            {[1, 2, 3].map((item) => (
              <div className="col-3" key={item}>
                <i className="fa fa-quote-left"></i>
                <p>
                  This is a sample testimonial feedback message from user {item}
                  .
                </p>
                <div className="rating" >
                  <i className="fa fa-star"></i>
                  <i className="fa fa-star"></i>
                  <i className="fa fa-star"></i>
                  <i className="fa fa-star-half-o"></i>
                  <i className="fa fa-star-o"></i>
                </div>
                <h3 style={{ padding:0}}>User {item}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Testomonials;
