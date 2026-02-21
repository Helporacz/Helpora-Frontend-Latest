import Alert from "react-bootstrap/Alert";
import "./AlertBox.scss";

export const AlertBox = ({ alert, color, message, setAlert }) => (
  <div className="alert-box">
    {alert && (
      <Alert variant={color} onClose={setAlert} dismissible>
        <span className="text-16-500">{message}</span>
      </Alert>
    )}
  </div>
);

export default AlertBox;
