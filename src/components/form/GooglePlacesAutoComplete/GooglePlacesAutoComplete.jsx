import LabelText from "../LabelText";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { useState } from "react";
import Loader from "components/layouts/Loader";
import "./GooglePlacesAutoComplete.scss";

const GooglePlacesAutoComplete = ({
  label,
  onChange,
  error,
  placeholder,
  id,
  defaultValue,
}) => {
  const [address, setAddress] = useState("");
  const handleSelect = async (selectedAddress) => {
    try {
      const results = await geocodeByAddress(selectedAddress);
      const latLng = await getLatLng(results[0]);
      console.log("Selected Address:", selectedAddress);
      console.log("Lat,Lng:", latLng);
      setAddress(selectedAddress);
    } catch (error) {
      console.error("Error selecting address:", error);
    }
  };

  return (
    <div id="place-input-container">
      {label && <LabelText label={label} />}
      <div className="google-input-block">
        <PlacesAutocomplete
          value={address}
          onChange={(value) => setAddress(value)}
          onSelect={handleSelect}
          // searchOptions={{ types: ["address"] }} // Optional: You can customize search options
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading,
          }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: "Type an address...",
                  className: "location-search-input",
                })}
              />
              <div className="autocomplete-dropdown-container">
                {loading ? (
                  <div className="cpt-20 cpb-20">
                    <Loader />
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      {...getSuggestionItemProps(suggestion, {
                        className: suggestion.active
                          ? "suggestion-item--active"
                          : "suggestion-item",
                      })}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
      </div>
      {error && (
        <span className="text-13-500 pt-1">
          <span style={{ color: "red" }}>{error}</span>
        </span>
      )}
      {/* <GooglePlacesAutoComplete
  label="Location"
  placeholder="Enter location"
  error=""
  onChange={(e) => {
    console.log(e);
  }}
  /> */}
    </div>
  );
};

export default GooglePlacesAutoComplete;
