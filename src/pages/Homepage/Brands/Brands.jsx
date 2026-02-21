import React from "react";
import "./Brands.scss";
import godrej from "../../../assets/images/logo-godrej.png";
import oppo from "../../../assets/images/logo-oppo.png";
// import coca from "../../../assets/images/logo-coca-cola.png";
import microsoft from "../../../assets/images/microsoft.png"
import philip from "../../../assets/images/logo-philips.png";
import paypal from "../../../assets/images/logo-paypal.png"

const Brands = () => {
  const brandLogos = [godrej, oppo,microsoft,philip,paypal];

  return (
    <>
      <div className="brands">
        <h1 style={{ textAlign: "center", marginTop: "50px",fontWeight:"700" }}>
          Companies We Work With
        </h1>
        <hr style={{ width: "40%", margin: "10px auto", border: "1px solid black", }} />
        <div className="small-container">
          <div className="row" >
            {brandLogos.map((logo, index) => (
              <div className="col-5" key={index} style={{ marginBlock:"50px" }}>
                <img src={logo} alt={`Brand ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Brands;
