import { Dropdown } from "react-bootstrap";
import LabelText from "../LabelText";
import "./PhoneNumber.scss";
import { dialCode } from "utils/constants/dialcodes";

const PhoneNumber = ({
  id,
  value,
  country_code,
  onChange,
  onCodeChange,
  label,
  required,
  error,
  onBlur,
}) => {
  let findObject = dialCode?.find((o) => o.code === country_code);
  let { dial_code, format } = findObject || {};
  const numberOnlyFromInput = (e) => {
    const value = e.target.value;
    const newVal = value.replace(/[^0-9]/g, "");
    return newVal;
  };
  const handelChangeCode = (e) => {
    onCodeChange({
      target: {
        id: "country_code",
        value: e?.code,
        data: e,
      },
    });
  };
  const handelValidReg = (value) => {
    let formatLength = format
      .replace(/\+/g, "")
      .replace(/\+/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .replace(/-/g, "")
      .replace(/\s/g, "");
    let valueFormat = value
      .replace(/\+/g, "")
      .replace(/\+/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .replace(/-/g, "")
      .replace(/\s/g, "");
    let isError = false;

    if (formatLength.length !== valueFormat.length && format) {
      isError = true;
    } else {
      isError = false;
    }
    return isError;
  };
  const handelChange = (e) => {
    onChange({
      target: {
        id: id,
        value: numberOnlyFromInput(e),
      },
    });
  };
  const handelBlur = (e) => {
    let isError = handelValidReg(e.target.value);
    if (onBlur) {
      onBlur(isError);
    }
  };

  return (
    <div id="phone-number-container">
      {label && <LabelText label={label} required={required} />}
      <div className="phone-number-input">
        <div className="dial-code-block">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              {dial_code} <i className="bi bi-chevron-down text-12-500 ms-1" />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {dialCode?.map((elem, index) => {
                let { name, code } = elem;
                return (
                  <Dropdown.Item
                    href=""
                    key={index}
                    className="d-flex align-items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      handelChangeCode(elem);
                    }}
                  >
                    <span className="image-block-flag">
                      <img
                        src={`https://flagpedia.net/data/flags/normal/${code.toLocaleLowerCase()}.png`}
                        alt={code}
                        className="fill-image"
                      />
                    </span>
                    <span>{name}</span>
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="saprator-block" />
        <div className="number-input-block">
          <input
            type="text"
            onChange={handelChange}
            onBlur={handelBlur}
            id={id}
            value={value}
          />
        </div>
      </div>
      {error && (
        <div className="text-12-400 color-carnation" style={{ color: "red" }}>
          {error}
        </div>
      )}
    </div>
  );
};
export default PhoneNumber;
// import PhoneInput from "react-phone-input-2";
// import LabelText from "../LabelText";
// import { countriesMasks } from "utils/constants";
// import "react-phone-input-2/lib/style.css";
// import "./PhoneNumber.scss";

// const PhoneNumber = ({
//   id,
//   label,
//   value,
//   placeholder,
//   countryCode,
//   onChange,
//   onBlur,
//   error,
//   required,

// }) => {
//   const handelChange = (phone, country) => {
//     let isError = handelValidReg(phone, country.format);
//     onChange({ target: { id: id, value: phone, isError: isError } });
//   };
//   const handelBlur = (e, country) => {
//     let isError = handelValidReg(e.target.value, country.format);
//     onBlur({ target: { id: id, value: e.target.value, isError: isError } });
//   };
//   const handelValidReg = (value, format) => {
//     let formatLength = format
//       .replace(/\+/g, "")
//       .replace(/\+/g, "")
//       .replace(/\(/g, "")
//       .replace(/\)/g, "")
//       .replace(/-/g, "")
//       .replace(/\s/g, "");
//     let valueFormat = value
//       .replace(/\+/g, "")
//       .replace(/\+/g, "")
//       .replace(/\(/g, "")
//       .replace(/\)/g, "")
//       .replace(/-/g, "")
//       .replace(/\s/g, "");
//     let isError = false;
//     if (formatLength.length !== valueFormat.length) {
//       isError = true;
//     } else {
//       isError = false;
//     }
//     return isError;
//   };

//   return (
//     <div id="phone-number-container">
//       {label && <LabelText label={label} required={required} />}
//       <div>
//         <PhoneInput
//           autoFormat
//           masks={countriesMasks}
//           placeholder={placeholder}
//           country={countryCode ? countryCode : "us"}
//           value={value}
//           onBlur={handelBlur}
//           onChange={handelChange}
//           inputProps={{
//             required: true,
//           }}
//         />
//         {error && (
//           <span className="text-13-500 pt-1">
//             <span style={{ color: "red" }}>{error}</span>
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };
// export default PhoneNumber;
