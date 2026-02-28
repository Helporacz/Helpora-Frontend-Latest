import moment from "moment";
import i18n from "@/lib/i18n-client";

export function getHeaderData() {
  const currentLang =
    i18n.language ||
    localStorage.getItem("helporaLng") ||
    localStorage.getItem("i18nextLng") ||
    "cz";
  
  let header = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": currentLang,
  };
  if (getDataFromLocalStorage("token")) {
    header = {
      ...header,
      ...{ Authorization: `Bearer ${getDataFromLocalStorage("token")}` },
    };
  }
  return header;
}

export const storeLocalStorageData = (newData) => {
  const decryptData = localStorage?.helpora
    ? JSON.parse(localStorage?.helpora)
    : {};
  localStorage.helpora = JSON.stringify({ ...decryptData, ...newData });
};

export const getDataFromLocalStorage = (key = "") => {
  let returnValue = "";
  if (localStorage?.helpora) {
    const localObjectData = JSON.parse(localStorage?.helpora);
    if (key) {
      returnValue = localObjectData[key] ? localObjectData[key] : "";
    } else {
      returnValue = localObjectData;
    }
  }
  return returnValue;
};

export const titleCaseString = (value) => {
  if (typeof value !== "string") return "";
  return value.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase()); // Capital first character of each word
};

export const objectToFormData = (obj) => {
  let formData = new FormData();
  for (let key in obj) {
    formData.append(key, obj[key]);
  }
  return formData;
};

export const objectToQueryParams = (object) => {
  return new URLSearchParams(object).toString();
};

export const trimLeftSpace = (value) => value.replace(/^\s+/g, ""); // Remove white space from left side
export const trimAllSpace = (value) => value.replace(/ /g, "");

export const getMonthList = (num) => {
  return [...Array(num)].map((_, i) => {
    return { id: moment().subtract(i, "month").format("MMM YYYY") };
  });
};

export const getYearList = (num) => {
  return [...Array(num)].map((_, i) => {
    return { id: moment().subtract(i, "year").format("YYYY") };
  });
};

// export const fetchLocationName = async (lat, long) => {
//   try {
//     const response = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${import.meta.env.VITE_MAP_API}`
//     );
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     console.log("data:", data);

//     if (data.results && data.results.length > 0) {
//       const locationName = data.results[0].formatted_address;
//       return locationName;
//     }
//     return null;
//   } catch (error) {
//     console.error("Error fetching location name: ", error);
//     return null;
//   }
// };
