import Order from "pages/AllOrders/AllOrders";
import Beauticians from "pages/Beauticians/Beauticians";
import Category from "pages/Category/Category";
import ChatPage from "pages/Chat/Chat";
import Clients from "pages/Clients";
import Dashboard from "pages/Dashboard";
import UserData from "pages/Dashboard/UserData";
import NotificationPage from "pages/Homepage/Notification/NotificationPage";
import InquieyForm from "pages/Inquiry/InquieyForm";
import KYCProcess from "pages/KYCProcess/KYCProcess";
import KYCApproval from "pages/KYCStatus/KYCApproval";
import KYCDetail from "pages/KYCStatus/KYCDetail";
import KYCStatus from "pages/KYCStatus/KYCStatus";
import Layout from "pages/Layout";
import MyServices from "pages/MyServices/MyServices";
import Orders from "pages/Orders/Orders";
import AddProvider from "pages/Provider/AddProvider";
import Reviews from "pages/Reviews/Reviews";
import ViewServices from "pages/Services/ViewServices/ViewServices";
import SlotManagment from "pages/SlotManagment/SlotManagment";
import UserProfile from "pages/UserProfile";
import AddAdmin from "pages/UserProfile/AddAdmin/AddAdmin";
import ManageSubscription from "pages/Subscription/ManageSubscription";
import Subscribers from "pages/Subscribers/Subscribers";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getAdminProfile, getUserProfile } from "store/globalSlice";
import { commonRoute } from "utils/constants";
import { getLocalizedPath } from "utils/localizedRoute";
import Regions from "pages/configration/Regions";
import City from "pages/configration/City";
import District from "pages/configration/District";

const routeArray = [
  { layoutId: "dashboard-container", path: commonRoute.dashboard, component: <Dashboard /> },
  { layoutId: "my-services-container", path: commonRoute.myServices, component: <MyServices /> },
  { layoutId: "user-data-container", path: commonRoute.userData, component: <UserData />, headerText: "Users Data" },
  { layoutId: "providers-container", path: commonRoute.providers, component: <Beauticians /> },
  { layoutId: "add-provider-register-container", path: commonRoute.registerProvider, component: <AddProvider />, isBack: true },
  { layoutId: "add-category-container", path: commonRoute.category, component: <Category />, isBack: true },
  { layoutId: "clients-container", path: commonRoute.clients, component: <Clients /> },
  { layoutId: "subscribers-container", path: commonRoute.subscribers, component: <Subscribers />, headerText: "Subscribers" },
  { layoutId: "services-container", path: commonRoute.Adminservices, component: <ViewServices /> },
  { layoutId: "admins-container", path: commonRoute.admins, component: "admin" },
  { layoutId: "my-profile-container", path: commonRoute.myProfile, component: <UserProfile />, isBack: true },
  { layoutId: "add-admin-container", path: commonRoute.addAdmin, component: <AddAdmin />, isBack: true },
  { layoutId: "get-orders-container", path: commonRoute.orders, component: <Orders /> },
  { layoutId: "get-orders-container", path: commonRoute.order, component: <Order /> },
  { path: commonRoute.moreOptions, to: `${commonRoute.moreOptions}/service-category`, isNavigate: true },
  { layoutId: "chat-container", path: commonRoute.prociderChat, component: <ChatPage /> },
  { layoutId: "slot-container", path: commonRoute.slots, component: <SlotManagment /> },
  { layoutId: "kyc-container", path: commonRoute.kycProcess, component: <KYCProcess /> },
  { layoutId: "kyc-status-container", path: commonRoute.kycStatus, component: <KYCStatus /> },
  { layoutId: "kyc-approval-container", path: commonRoute.kycApproval, component: <KYCApproval /> },
  { layoutId: "kyc-detailStatus-container", path: commonRoute.kycStatusDetail, component: <KYCDetail /> },
  { path: commonRoute.notification, component: <NotificationPage /> },
  { path: commonRoute.comments, component: <Reviews /> },
  { path: commonRoute.inquiry, component: <InquieyForm /> },
  { layoutId: "regions-container", path: commonRoute.regions, component: <Regions /> },
  { layoutId: "city-container", path: commonRoute.city, component: <City /> },
  { layoutId: "district-container", path: commonRoute.district, component: <District /> },
  { layoutId: "subscription-manage-container", path: commonRoute.subscriptionManage, component: <ManageSubscription />, headerText: "Subscription" },
];

const AppRoute = () => {
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const dispatch = useDispatch();

  const globalApis = useCallback(async () => {
    if (userRole === "superAdmin") {
      await dispatch(getAdminProfile());
    } else {
      await dispatch(getUserProfile(userId));
    }
  }, [dispatch, userRole, userId]);

  useEffect(() => {
    globalApis();
  }, [globalApis]);

  const languages = ["en", "cz"];
  const defaultLang = "cz";

  return (
    <BrowserRouter>
      <Routes>
        {languages.map((lang) =>
          routeArray.map((elem, index) => {
            const { layoutId, isBack, headerText, isNavigate, path, to, component } = elem;
            const localizedPath = getLocalizedPath(path, lang);

            return (
              <Route
                key={`${lang}-${index}`}
                path={localizedPath}
                element={
                  isNavigate ? (
                    <Navigate to={to} replace />
                  ) : (
                    <Layout layoutId={layoutId || ""} isBack={isBack} headerText={headerText}>
                      {component}
                    </Layout>
                  )
                }
              />
            );
          })
        )}

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <Navigate
              to={getLocalizedPath(commonRoute.dashboard, defaultLang)}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoute;
