import StatusContainer from "components/layouts/StatusContainer";
import Dropdown from "react-bootstrap/Dropdown";
import Table from "react-bootstrap/Table";
import { icons } from "utils/constants";

const TableView = ({ data, handelStatus }) => {
  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>Admin</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((elem, index) => {
            const { id, name, role, isActive } = elem;
            return (
              <tr key={index}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-dashboard-primary p-3" />
                    <div>
                      <div className="text-13-500">{name}</div>
                      <div className="text-9-500 color-blue-60">{id}</div>
                    </div>
                  </div>
                </td>
                <td>{role}</td>
                <td>
                  <div className="d-flex gap-2">
                    <span className="text-13-500 color-black-100">
                      {isActive ? "Active" : "Inactive"}
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
                </td>
                <td>
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
export default TableView;
