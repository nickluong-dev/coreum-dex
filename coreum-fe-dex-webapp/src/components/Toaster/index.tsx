import { CSSProperties } from "react";
import { ToastContainer, ToastPosition } from "react-toastify";
// import "react-toastify/dist/ReactToastify.min.css";
import "./Toaster.scss";

interface ToasterProps {
  customStyle?: CSSProperties;
  position?: ToastPosition;
}

export const Toaster = ({
  customStyle,
  position = "top-right",
}: ToasterProps) => {
  return (
    <ToastContainer
      style={{ zIndex: 8000, ...customStyle }}
      autoClose={5000}
      closeOnClick
      hideProgressBar
      pauseOnHover
      theme={"colored"}
      position={position}
      className={`toaster-container `}
      bodyClassName={`toaster-body`}
      closeButton={({ closeToast }) => (
        <img
          src=""
          style={{
            width: 17,
            marginLeft: 12,
            marginRight: -4,
          }}
          onClick={closeToast}
        />
      )}
    />
  );
};
