import ServiceDetails from "components/subServices/ServiceDetails";
import SubServices from "components/subServices/SubServices";
import About from "pages/About/About";
import ChangePassword from "pages/Auth/ChangePassword";
import Login from "pages/Auth/Login";
import AdminLogin from "pages/Auth/Login/AdminLogin";
import Register from "pages/Auth/Register/Register";
import ChatPage from "pages/Chat/Chat";
import Contact from "pages/Contact/Contact";
import Forgot from "pages/Forgotpassword/Forgot";
import Becomeprovider from "pages/Homepage/Headersection/Becomeprovider";
import Bookservice from "pages/Homepage/Headersection/Bookservice";
import Homepage from "pages/Homepage/Homepage";
import NotificationPage from "pages/Homepage/Notification/NotificationPage";
import Setlogin from "pages/Login/Setlogin";
import MainLayout from "pages/MainLayout/MainLayout";
import Privacy from "pages/Privacy/Privacy";
import MyBookings from "pages/MyBookings/MyBookings";
import Profile from "pages/Profile/Profile";
import SetRegister from "pages/Register/RegisterSection";
import Service from "pages/Service/Service";
import Showprofile from "pages/Showprofile/Showprofile";
import AddAdmin from "pages/UserProfile/AddAdmin/AddAdmin";
import Terms from "pages/Terms/Terms";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { commonRoute } from "utils/constants";
import { getDataFromLocalStorage } from "utils/helpers";
import { getLocalizedPath } from "utils/localizedRoute";
import Forgotpassword from "pages/Auth/Forgotpassword/Forgotpassword";
import Forgots from "pages/Auth/Forgot/Forgots";
import Resetpassword from "pages/Auth/ResetPassword/ResetPassword";
import ResetPasswordUser from "pages/Auth/ResetPassword/ResetPasswordUser";

const authRoute = () => {
  const languages = ["en", "cz"];
  const defaultLang = "cz";
  const token = getDataFromLocalStorage("token");

  return (
    <BrowserRouter>
      <Routes>
        {languages.map((lang) => {

          return (
            <Route key={lang}>
              <Route
                path={getLocalizedPath(commonRoute.logins, lang)}
                element={<Setlogin />}
              />
              <Route
                path={getLocalizedPath(commonRoute.register, lang)}
                element={<SetRegister />}
              />
              <Route
                path={getLocalizedPath(commonRoute.forgot, lang)}
                element={<Forgots />}
              />
              <Route
                path={getLocalizedPath(commonRoute.adminLogin, lang)}
                element={<AdminLogin />}
              />
              <Route
                path={getLocalizedPath(commonRoute.signUp, lang)}
                element={<Register />}
              />
              <Route
                path={getLocalizedPath(commonRoute.login, lang)}
                element={<Login />}
              />
              <Route
                path={getLocalizedPath(commonRoute.changePassword, lang)}
                element={<ChangePassword />}
              />
              <Route
                path={getLocalizedPath(commonRoute.forgotpassword, lang)}
                element={<Forgotpassword />}
              />
              <Route
                path={getLocalizedPath(commonRoute.resetPassword, lang)}
                element={<Resetpassword />}
              />
              <Route
                path={getLocalizedPath(commonRoute.resetUserPassword, lang)}
                element={<ResetPasswordUser />}
              />
            </Route>
          );
        })}

        {/* Routes with MainLayout wrapper */}
        {languages.map((lang) => {
          const pathPrefix = lang === defaultLang ? "" : `${lang}/*`;

          return (
            <Route key={lang} path={pathPrefix} element={<MainLayout />}>
              <Route path={commonRoute.home.slice(1)} element={<Homepage />} />
              <Route
                path={commonRoute.becomeprovider.slice(1)}
                element={<Becomeprovider />}
              />
              <Route
                path={commonRoute.bookservice.slice(1)}
                element={<Bookservice />}
              />
              <Route
                path={commonRoute.service.slice(1)}
                element={<Service />}
              />
              <Route
                path={commonRoute.categories.slice(1)}
                element={<SubServices />}
              />
              <Route
                path={commonRoute.serviceById.slice(1)}
                element={<ServiceDetails />}
              />
              <Route path={commonRoute.about.slice(1)} element={<About />} />
              <Route
                path={commonRoute.contact.slice(1)}
                element={<Contact />}
              />
              <Route path={commonRoute.terms.slice(1)} element={<Terms />} />
              <Route path={commonRoute.privacy.slice(1)} element={<Privacy />} />
              <Route
                path={commonRoute.showprofile.slice(1)}
                element={<Showprofile />}
              />

              {token && (
                <>
                  <Route
                    path={commonRoute.myBookings.slice(1)}
                    element={<MyBookings />}
                  />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="user/profile" element={<Profile />} />
                  <Route path="user/profile/:id" element={<AddAdmin />} />
                  <Route path="notifications" element={<NotificationPage />} />
                </>
              )}
            </Route>
          );
        })}

        <Route
          path="*"
          element={<Navigate to={defaultLang === "cz" ? "/" : "/en"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default authRoute;
