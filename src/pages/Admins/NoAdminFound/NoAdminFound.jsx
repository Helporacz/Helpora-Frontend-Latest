import Button from "components/form/Button";
import { useNavigate } from "react-router-dom";
import { icons } from "utils/constants";

const NoAdminFound = ({ setIsData }) => {
  const navigate = useNavigate();
  return (
    <div className="card-effect cmt-24 cms-24 cme-24 h-100 pb-5">
      <div className="d-flex justify-content-between align-items-center cps-24 cpe-24 cpt-24 cpb-24">
        <div className="text-20-700 color-dashboard-primary">Admins</div>

        <Button
          btnText="ADD ADMIN"
          btnStyle="PD"
          iconType="L-Add"
          className="cps-20 cpe-20"
          onClick={() => {
            setIsData(true);
          }}
        />
      </div>
      <div className="d-flex justify-content-center align-items-center text-center">
        <div>
          <div className="d-flex justify-content-center mb-3">
            <img src={icons.noUser} alt="no user" style={{ height: "142px" }} />
          </div>
          <div className="d-flex flex-column align-items-center">
            <div className="text-20-700 color-dashboard-primary">
              No Users Yet
            </div>
            <div className="w-75 text-15-500 color-black-80">
              There are currently no users created. To get started, create a new
              user.
            </div>
            <div className="d-flex cmt-16">
              <Button
                btnText="ADD ADMIN"
                btnStyle="PD"
                iconType="L-Add"
                className="cps-20 cpe-20"
                onClick={() => {
                  navigate("/admins/add-admin");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoAdminFound;
