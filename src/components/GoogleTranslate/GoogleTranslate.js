import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import ukFlag from "../flags/uk.svg";
import czFlag from "../flags/cz.svg";
import ruFlag from "../flags/ru.svg";
import "./Translatedropdown.scss";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, normalizeLanguage } from "@/lib/i18n-client";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: ukFlag },
  { code: "cz", label: "Czech", flag: czFlag },
  { code: "ru", label: "Russian", flag: ruFlag },
];

const GoogleTranslate = () => {
  const { i18n } = useTranslation();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);

  const defaultLang = DEFAULT_LANGUAGE;
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language || defaultLang);
  const selectedLanguage =
    LANGUAGE_OPTIONS.find(({ code }) => code === currentLang) ||
    LANGUAGE_OPTIONS.find(({ code }) => code === defaultLang) ||
    LANGUAGE_OPTIONS[0];
  const nonDefaultLanguages = SUPPORTED_LANGUAGES.filter((langCode) => langCode !== defaultLang);

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

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
    
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (nonDefaultLanguages.includes(pathSegments[0])) {
      pathSegments.shift();
    }

    if (lang !== defaultLang) {
      pathSegments.unshift(lang);
    }

    const newPath = "/" + pathSegments.join("/");
    navigate(newPath, { replace: true });
    setIsLangOpen(false);
  };

  return (
    <div ref={dropdownRef} className="custom-translate">
      <div
        className="d-flex gap-2 align-items-center selected-lang cursor-pointer"
        onClick={() => setIsLangOpen((prev) => !prev)}
      >
        <img
          src={selectedLanguage.flag}
          alt={selectedLanguage.code}
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
          {LANGUAGE_OPTIONS.map((languageOption) => (
            <div
              key={languageOption.code}
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => changeLang(languageOption.code)}
            >
              <img src={languageOption.flag} alt={languageOption.code} className="flag-icon" />{" "}
              {languageOption.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
