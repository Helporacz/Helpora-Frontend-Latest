import { useState } from "react";
import AdminList from "./AdminList/AdminList";
import NoAdminFound from "./NoAdminFound";
import "./Admins.scss";

const Admins = () => {
  const [isData, setIsData] = useState(false);
  return <>{isData ? <AdminList /> : <NoAdminFound setIsData={setIsData} />}</>;
};
export default Admins;
