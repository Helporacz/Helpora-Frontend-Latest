import CheckBox from "components/form/CheckBox";
import StatusContainer from "components/layouts/StatusContainer";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";
import { icons } from "utils/constants";

const CardView = ({ data, handelStatus }) => {
  const navigate = useNavigate();
  return (
    <div className="admin-list-item-container">
      {data.map((elem, index) => {
        return (
          <div className="card-effect admin-list-item" key={index}>
            <div className={`d-flex justify-content-between `}>
              <span className={elem.isActive ? "" : "opacity-50"}>
                <CheckBox />
              </span>
              <span>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="" id="dropdown-basic">
                    <img
                      src={icons.threeDots}
                      alt="options"
                      className="pointer"
                    />
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      href=""
                      className="d-flex align-items-center gap-2 mb-1"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/admins/profile-details/${index + 1}`);
                      }}
                    >
                      <span>
                        <img src={icons.viewDetails} alt="details" />
                      </span>
                      <span className="mt-1">View Details</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      href=""
                      className="d-flex align-items-center gap-2"
                    >
                      <span>
                        <img src={icons.trash} alt="trash" />
                      </span>
                      <span className="mt-1">Delete Admin</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </span>
            </div>
            <div
              className={`center-profile-block cmt-16 ${
                elem.isActive ? "" : "opacity-50"
              }`}
            >
              <div className="profile-ind">
                <img src={icons.userChat} alt="chat" className="chat-icons" />
              </div>
            </div>
            <div
              className={`text-15-500 text-center ${
                elem.isActive ? "" : "opacity-50"
              }`}
            >
              {elem.name}
            </div>
            <div
              className={`text-13-500 text-center color-blue-60 ${
                elem.isActive ? "" : "opacity-50"
              }`}
            >
              {elem.id}
            </div>
            <div
              className={`text-13-500 bg-blue-10 text-center rounded-pill color-dashboard-primary pt-1 pb-1 mt-2 ${
                elem.isActive ? "" : "opacity-50"
              }`}
            >
              {elem.role}
            </div>
            <div className="border-top mt-3 mb-3" />
            <div className="d-flex justify-content-end gap-2">
              <span className="text-13-500 color-black-100">
                {elem.isActive ? "Active" : "Inactive"}
              </span>
              <span>
                <StatusContainer
                  title="Admin"
                  data={elem}
                  apiFunction={async () => {
                    return { status: 200 };
                  }}
                  handelSuccess={() => {
                    handelStatus(elem);
                  }}
                />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default CardView;
