import AppRoute from "./routes/appRoute";
import AuthRoute from "./routes/authRoute";
import ProviderSubscriptionRoute from "./routes/providerSubscriptionRoute";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getDataFromLocalStorage, storeLocalStorageData } from "utils/helpers";
import ErrorPopup from "components/layouts/ErrorPopup";
import Loader from "components/layouts/Loader/Loader";
import { api } from "services";
import "assets/main.scss";
import "assets/animation.scss";

function App() {
  const { userState } = useSelector((state) => ({
    userState: state.global.userState,
  }));

  const [subscriptionState, setSubscriptionState] = useState({
    loading: false,
    active: true,
  });

  useEffect(() => {
  }, [userState]);

  const token = getDataFromLocalStorage("token");
  const userRole = localStorage.getItem("userRole");

  const isAdminOrProvider =
    token && (userRole === "superAdmin" || userRole === "provider");

  useEffect(() => {
    let isMounted = true;

    const fetchSubscriptionStatus = async () => {
      if (token && userRole === "provider") {
        setSubscriptionState({ loading: true, active: false });

        const response = await api.get("/stripe/subscription-status");
        const fallbackActive = localStorage.getItem("subscriptionActive") === "true";
        const status = response?.data?.status || "inactive";
        const isActive =
          typeof response?.data?.isActive === "boolean"
            ? response.data.isActive
            : fallbackActive;

        localStorage.setItem("subscriptionStatus", status);
        localStorage.setItem("subscriptionActive", isActive ? "true" : "false");
        storeLocalStorageData({
          subscriptionStatus: status,
          subscriptionActive: isActive,
        });

        if (isMounted) {
          setSubscriptionState({ loading: false, active: isActive });
        }
        return;
      }

      if (isMounted) {
        setSubscriptionState({ loading: false, active: true });
      }
    };

    fetchSubscriptionStatus();
    return () => {
      isMounted = false;
    };
  }, [token, userRole]);
    
  return (
    <div className="App">
      <ErrorPopup />
      {isAdminOrProvider ? (
        userRole === "provider" ? (
          subscriptionState.loading ? (
            <Loader size="md" />
          ) : subscriptionState.active ? (
            <AppRoute />
          ) : (
            <ProviderSubscriptionRoute />
          )
        ) : (
          <AppRoute />
        )
      ) : (
        <AuthRoute />
      )}
    </div>
  );
}

export default App;
