import Footer from "components/Footer/Footer";
import Navbars from "pages/Homepage/Navbar/Navbars";
import React from "react";
import { Outlet } from "react-router-dom";
import useSyncLanguageWithUrl from "utils/useSyncLanguageWithUrl";

const MainLayout = () => {
  useSyncLanguageWithUrl("cz");
  return (
    <>
      <Navbars />
      <main style={{ minHeight: "80vh" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
