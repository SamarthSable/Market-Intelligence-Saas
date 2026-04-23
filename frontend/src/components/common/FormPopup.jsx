import { Toast, ToastContainer } from "react-bootstrap";

const DEFAULT_TITLES = {
  success: "Success",
  danger: "Something went wrong",
  warning: "Check the form",
  info: "Notice",
};

export default function FormPopup({
  show,
  onClose,
  title,
  message,
  variant = "danger",
}) {
  if (!message) {
    return null;
  }

  return (
    <ToastContainer position="top-end" className="p-3 app-toast-container">
      <Toast
        show={show}
        onClose={onClose}
        delay={3800}
        autohide
        className={`app-toast app-toast-${variant}`}
      >
        <Toast.Header className="app-toast-header">
          <strong className="me-auto">{title || DEFAULT_TITLES[variant] || "Notice"}</strong>
        </Toast.Header>
        <Toast.Body className="app-toast-body">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
