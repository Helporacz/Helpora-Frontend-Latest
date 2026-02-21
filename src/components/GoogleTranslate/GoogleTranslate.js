import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import ukFlag from "../flags/uk.svg";
import czFlag from "../flags/cz.svg";
import "./Translatedropdown.scss";

const GoogleTranslate = () => {
  const { i18n } = useTranslation();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);

  const currentLang = i18n.language || "cz";
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // mobile detection
  useEffect(() => {
    const handleResize = () => {
      setOpenLeft(window.innerWidth < 800);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const defaultLang = "cz";

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", defaultLang);
    
    const pathSegments = location.pathname.split("/").filter(Boolean);

    if (lang === defaultLang) {
      if (["en"].includes(pathSegments[0])) pathSegments.shift();
    } else {
      if (pathSegments[0] !== lang) pathSegments.unshift(lang);
    }

    const newPath = "/" + pathSegments.join("/");
    navigate(newPath, { replace: true });
     setIsLangOpen(false)
  };

  return (
    <div ref={dropdownRef} className="custom-translate">
      <div
        className="d-flex gap-2 align-items-center selected-lang cursor-pointer"
        onClick={() => setIsLangOpen((prev) => !prev)}
      >
        <img
          src={currentLang === "cz" ? czFlag : ukFlag}
          alt={currentLang}
          className="flag-icon"
        />
        <FiChevronDown
          size={18}
          className={`chevron-icon ${isLangOpen ? "rotate-up" : ""}`}
        />
      </div>

      {isLangOpen && (
        <div
          className={`dropdown-menu-modern shadow-lg ${
            openLeft ? "left-0" : "right-0"
          }`}
        >
          <div
            className="dropdown-item d-flex align-items-center gap-2"
            onClick={() => changeLang("en")}
          >
            <img src={ukFlag} alt="en" className="flag-icon" /> English
          </div>

          <div
            className="dropdown-item d-flex align-items-center gap-2"
            onClick={() => changeLang("cz")}
          >
            <img src={czFlag} alt="cz" className="flag-icon" /> Czech
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
