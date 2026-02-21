import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setApiError } from "store/globalSlice";
import AlertBox from "../AlertBox";

const ErrorPopup = () => {
  const dispatch = useDispatch();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "danger",
  });

  const { apiError } = useSelector((state) => ({
    apiError: state.global.apiError,
  }));
  useEffect(() => {
    setAlert(apiError);
    if (apiError?.show) {
      setTimeout(() => {
        dispatch(setApiError({ show: false, message: "", type: "danger" }));
      }, 5000);
    }
  }, [apiError]);
  return (
    <AlertBox
      alert={alert.show}
      color={alert.type}
      message={alert.message}
      setAlert={setAlert}
    />
  );
};
export default ErrorPopup;
