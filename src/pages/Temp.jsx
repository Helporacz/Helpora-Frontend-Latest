import Button from "components/form/Button";
import SearchInput from "components/form/SearchInput/SearchInput";
import MenuOption from "components/layouts/MenuOption";
import StatusContainer from "components/layouts/StatusContainer/StatusContainer";
import UserProfileLayout from "components/layouts/UserProfileLayout";
import { icons } from "utils/constants";

const Temp = () => {
  const userImage =
    "http://res.cloudinary.com/dakpjnpuu/image/upload/v1680871796/main/Profile/jgotyyhaznsg2hpalfs5.jpg";
  const profileSize = ["21", "30", "40", "42", "50", "60", "70", "82"];
  return (
    <div className="card-effect p-3 mt-4">
      <div className="d-flex flex-wrap gap-2 mb-2">
        <Button btnText="Submit" btnStyle="DD" />
        <Button btnText="Submit" btnStyle="PD" />
        <Button btnText="Submit" btnStyle="PO" />
        <Button btnText="Submit" btnStyle="PLO" />
        <Button btnText="Submit" btnStyle="BO" />
      </div>
      <div className="d-flex flex-wrap gap-2">
        <div className="option-chat">
          <MenuOption
            icon={<Button btnText="All" btnStyle="PLO" iconType="R-Filter" />}
            option={[
              {
                text: "All",
                onClick: () => {},
              },
              {
                text: "Active",
                onClick: () => {},
              },
              {
                text: "Inactive",
                onClick: () => {},
              },
            ]}
          />
        </div>
        <Button btnText="ARCHIVE" btnStyle="PLO" iconType="L-Archive" />
        <div className="option-chat">
          <MenuOption
            icon={
              <Button btnText="DOWNLOAD" btnStyle="PLO" iconType="L-Download" />
            }
            option={[
              {
                text: "Excel File",
                onClick: () => {},
              },
              {
                text: "CSV File",
                onClick: () => {},
              },
              {
                text: "PDF File",
                onClick: () => {},
              },
            ]}
          />
        </div>
        <Button btnText="ADD USER" btnStyle="PD" iconType="L-Add" />
        <Button
          btnText="Go to next slide"
          btnStyle="PLO"
          iconType="R-Arrow"
          className="rounded-pill"
        />
      </div>
      <div className="d-flex align-items-center flex-wrap mt-3 gap-3">
        <div>
          <SearchInput placeholder="Search beautician" />
        </div>
        <div>
          <StatusContainer
            data={{ id: "1", status: "0" }}
            title="User"
            handelSuccess={() => {}}
            apiFunction={() => {
              return { status: 200 };
            }}
          />
        </div>
        <div className="option-chat">
          <MenuOption
            icon={<img src={icons.threeDots} alt="menu" />}
            option={[
              {
                icon: <img src={icons.eyeSlash} alt="hide" />,
                text: "Hide Gist",
                onClick: () => {},
              },
              {
                icon: <img src={icons.trash} alt="delete" />,
                text: "Delete Gist",
                onClick: () => {},
              },
            ]}
          />
        </div>
      </div>
      {profileSize.map((size, key) => {
        return (
          <div className="d-flex flex-wrap gap-2 mt-3" key={key}>
            <UserProfileLayout url={userImage} size={size} isSquare />
            <UserProfileLayout url={userImage} size={size} />
            <UserProfileLayout size={size} url={userImage} status="2" />
            <UserProfileLayout size={size} />
            <UserProfileLayout size={size} status="2" />
            <UserProfileLayout size={size} text={size} status="2" />
          </div>
        );
      })}
    </div>
  );
};
export default Temp;
