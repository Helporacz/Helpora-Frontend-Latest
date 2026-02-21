import { Spinner } from "react-bootstrap";

const Loader = ({ size, as, animation, className }) => {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <Spinner
        animation={animation || "border"}
        as={as || "span"}
        size={size || "sm"}
        className={className || ""}
      />
    </div>
  );
};
export default Loader;
