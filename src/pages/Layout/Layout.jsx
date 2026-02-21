import Header from "pages/Layout/Header";
import Sidebar from "pages/Layout/Sidebar";
import useSyncLanguageWithUrl from "utils/useSyncLanguageWithUrl";
import "./Layout.scss";

const Layout = ({ layoutId, children, isBack, headerText }) => {
  useSyncLanguageWithUrl("cz");

  return (
    <div id="layout-container" className="d-flex">
      <div id="left-side-container">
        <Sidebar />
      </div>
      <div id="right-side-block">
        <div>
          <Header isBack={isBack} headerText={headerText} />
        </div>

        <div id={layoutId ? layoutId : ""} className="Pomonike-body p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Layout;
