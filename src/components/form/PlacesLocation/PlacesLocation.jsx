import React, { useRef } from "react";
import { StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";
import { forEach } from "lodash";
import "./PlacesLocation.scss";
import LabelText from "../LabelText";
const libraries = ["places"];

const PlacesLocation = ({ label, onChange, placeholder, error }) => {
  const inputRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_API,
    libraries,
  });

  const handlePlaceChanged = async () => {
    const [place] = inputRef.current.getPlaces();
    if (place) {
      const lat = place.geometry.location.lat();
      const long = place.geometry.location.lng();
      let locationData = {};
      if (place) {
        locationData = {
          address: place?.formatted_address,
          latitude: lat,
          longitude: long,
        };
        const addressData = place?.address_components;
        forEach(addressData, (elm) => {
          const { long_name, types } = elm;
          locationData[types[0]] = long_name;
        });
      }
      onChange(locationData);
    }
  };
  return (
    <div id="place-input-container">
      {label && <LabelText label={label} />}
      {isLoaded && (
        <StandaloneSearchBox
          onLoad={(ref) => (inputRef.current = ref)}
          onPlacesChanged={handlePlaceChanged}
        >
          <input
            type="text"
            // className="form-control"
            placeholder={placeholder}
          />
        </StandaloneSearchBox>
      )}
      {error && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </span>
      )}
    </div>
  );
};

export default PlacesLocation;
