import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Becomeservice.scss";
import { useTranslation } from "react-i18next";

const Bookservice = () => {
  const { t, i18n } = useTranslation();
  const faqData = [
    {
      question: t("section24.text1"),
      answer: [t("section24.text2"), t("section24.text3")],
    },
    {
      question: t("section24.text4"),
      answer: [
        t("section24.text5"),
        t("section24.text6"),
        t("section24.text7"),
      ],
    },
    {
      question: t("section24.text8"),
      answer: [
        t("section24.text9"),
        t("section24.text10"),
        t("section24.text11"),
      ],
    },
    {
      question: t("section24.text12"),
      answer: [t("section24.text13"), t("section24.text14")],
    },
    {
      question: t("section24.text15"),
      answer: [t("section24.text16"), t("section24.text17")],
    },
    {
      question: t("section24.text18"),
      answer: [t("section24.text19"), t("section24.text20")],
    },
    {
      question: t("section24.text21"),
      answer: [t("section24.text22"), t("section24.text23")],
    },
    {
      question: t("section24.text24"),
      answer: [t("section24.text25"), t("section24.text26")],
    },
    {
      question: t("section24.text27"),
      answer: [t("section24.text28"), t("section24.text29")],
    },
    {
      question: t("section24.text30"),
      answer: [t("section24.text31"), t("section24.text32")],
    },
  ];
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleIndex = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <div className="containerbecome">
      <div style={{ display: "flex", justifyContent: "end " }}>
        <button className="service-btns" onClick={() => navigate("/service")}>
          {t("section16.text1")}
        </button>
      </div>
      <h1 className="titlesbecome1" style={{ marginTop: "20px" }}>
        {t("section16.text2")}
      </h1>
      <p className="paratext">{t("section16.text3")}</p>
      <h2 className="headertitle"> {t("section16.text4")}</h2>
      <h1 className="titlesbecome123"> {t("section16.text5")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p> {t("section16.text6")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text7")}</p>
          </li>
        </li>
      </ul>
      <h1 className="titlesbecome123"> {t("section16.text8")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p> {t("section16.text9")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text10")}</p>
          </li>
        </li>
      </ul>
      <h1 className="titlesbecome123"> {t("section16.text11")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p> {t("section16.text12")}</p>
          </li>
          <li className="becomeli">
            <p> {t("section16.text13")}</p>
          </li>
        </li>
      </ul>
      <h1 className="titlesbecome123"> {t("section16.text15")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p> {t("section16.text16")}</p>
          </li>
          <li className="becomeli">
            <p> {t("section16.text17")}</p>
          </li>
        </li>
      </ul>
      <h2 className="headertitle"> {t("section16.text18")}</h2>
      <ul className="becomeul1">
        <li className="becomeli1"> {t("section16.text19")}</li>
        <li className="becomeli1"> {t("section16.text20")}</li>
        <li className="becomeli1">{t("section16.text21")} </li>
        <li className="becomeli1">{t("section16.text22")}</li>
        <li className="becomeli1">{t("section16.text23")}</li>
        <li className="becomeli1">{t("section16.text24")}</li>
        <li className="becomeli1">{t("section16.text25")}</li>
        <li className="becomeli1">{t("section16.text26")}</li>
        <li className="becomeli1">{t("section16.text27")}</li>
        <li className="becomeli1">{t("section16.text28")} </li>
      </ul>
      <h2 className="headertitle">{t("section16.text29")}</h2>
      <p className="paratext">{t("section16.text30")}</p>
      <h1 className="titlesbecome123">{t("section16.text31")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p>{t("section16.text32")}</p>
          </li>
        </li>
      </ul>
      <h1 className="titlesbecome123">{t("section16.text33")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p>{t("section16.text34")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text35")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text36")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text37")}</p>
          </li>
        </li>
      </ul>
      <h1 className="titlesbecome123">{t("section16.text38")}</h1>
      <ul className="becomeul">
        <li className="becomeli">
          <p>{t("section16.text39")} </p>
        </li>
      </ul>
      <h1 className="titlesbecome123">{t("section16.text40")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p>{t("section16.text41")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text42")}</p>
          </li>
        </li>
      </ul>
      <h1 className="titlesbecome123">{t("section16.text43")} </h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p>{t("section16.text44")}</p>
          </li>
        </li>
      </ul>
      <h1 className="titlesbecome123">{t("section16.text45")}</h1>
      <ul className="becomeul">
        <li>
          <li className="becomeli">
            <p>{t("section16.text46")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text47")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text48")}</p>
          </li>
          <li className="becomeli">
            <p>{t("section16.text49")}</p>
          </li>
          <li>
            <p className="disc-paragraph-font">{t("section16.text50")}</p>
            <ul className="becomeul1">
              <li className="becomeli1 disc-font-size">
                {t("section16.text51")}{" "}
              </li>
              <li className="becomeli1 disc-font-size">
                {t("section16.text52")}
              </li>
              <li className="becomeli1 disc-font-size">
                {t("section16.text53")}
              </li>
              <li className="becomeli1 disc-font-size">
                {t("section16.text54")}{" "}
              </li>
            </ul>
          </li>
        </li>
      </ul>
      <div className="faq-accordion">
        <h2 className="headertitle">{t("section16.text55")}</h2>
        {faqData.map((item, index) => (
          <div key={index} className="faq-item">
            <h3
              className={`faq-question  ${
                activeIndex === index ? "active" : ""
              }`}
              onClick={() => toggleIndex(index)}
            >
              {item.question}
              <span className="faq-icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </h3>
            <ul className={`faq-answer ${activeIndex === index ? "show" : ""}`}>
              {item.answer.map((ans, idx) => (
                <li key={idx}>{ans}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* <ul className="becomeul">
        <li className="becomeli">Upload a profile photo (professional) </li>
        <li className="becomeli">
          Add your skills, services you offer, availability schedule, and
          hourly/rate price (or price tiers).
        </li>
        <li className="becomeli">
          Write a short bio describing your experience and specialties.
        </li>
      </ul>
      <h1 className="titlesbecome">Verification & Approval</h1>
      <ul className="becomeul">
        <li className="becomeli">
          Submit required documents (ID verification, any required licenses or
          certifications, if applicable).
        </li>
        <li className="becomeli">
          Helpora checks and approves your profile to ensure trust & quality.
        </li>
      </ul>
      <h1 className="titlesbecome">Accept Our Terms & Guidelines</h1>
      <ul className="becomeul">
        <li className="becomeli">
          Read and accept Helpora’s Provider Agreement and Code of Conduct.
        </li>
        <li className="becomeli">
          Confirm that you will follow platform rules for quality, conduct, and
          service delivery.
        </li>
      </ul>
      <h1 className="titlesbecome">Go Live & Start Receiving Jobs</h1>
      <ul className="becomeul">
        <li className="becomeli">
          Once approved, your profile becomes visible to clients.
        </li>
        <li className="becomeli">
          Clients can book you directly; you’ll get notifications and start
          getting service requests.
        </li>
      </ul> */}
    </div>
  );
};

export default Bookservice;
