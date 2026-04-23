import { useRef, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth.api";
import { loginSuccess } from "../../app/auth.slice";
import FormPopup from "../../components/common/FormPopup";
import { isValidEmail } from "../../utils/validation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    variant: "danger",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  function hidePopup() {
    setPopup((current) => ({ ...current, show: false }));
  }

  function showPopup(message, options = {}) {
    setPopup({
      show: true,
      title: options.title || "",
      message,
      variant: options.variant || "danger",
    });
  }

  function clearFieldError(field) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors = {};
    const normalizedEmail = email.trim().toLowerCase();
    let firstInvalidInput = null;

    if (!normalizedEmail) {
      nextErrors.email = "Enter your email address.";
      firstInvalidInput = emailInputRef.current;
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
      firstInvalidInput = emailInputRef.current;
    }

    if (!password.trim()) {
      nextErrors.password = "Enter your password.";
      firstInvalidInput = firstInvalidInput || passwordInputRef.current;
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showPopup(Object.values(nextErrors)[0], {
        title: "Login validation",
        variant: "warning",
      });
      firstInvalidInput?.focus();
      return null;
    }

    return {
      email: normalizedEmail,
      password,
    };
  }

  async function handleLogin(event) {
    event.preventDefault();

    const payload = validateForm();
    if (!payload) {
      return;
    }

    try {
      setLoading(true);
      hidePopup();

      const res = await loginUser(payload);

      dispatch(loginSuccess(res.data));
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role;

      if (role === "client") navigate("/client");
      if (role === "analyst") navigate("/analyst");
      if (role === "admin") navigate("/admin");
    } catch (err) {
      const message = err?.response?.data?.error || "Unable to log in right now.";
      showPopup(message, {
        title: "Login failed",
      });
      setFieldErrors({
        email: "Check your email and password.",
        password: "Check your email and password.",
      });
      passwordInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <FormPopup
        show={popup.show}
        onClose={hidePopup}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
      />

      <div className="auth-card">
        <h3>Welcome Back</h3>
        <p className="mt-3 text-center">Login to your MarketIntel account</p>

        <Form onSubmit={handleLogin} noValidate>
          <Form.Control
            ref={emailInputRef}
            type="email"
            placeholder="Email"
            className="mb-3"
            value={email}
            isInvalid={Boolean(fieldErrors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
          />
          <Form.Control.Feedback type="invalid" className="mb-3">
            {fieldErrors.email}
          </Form.Control.Feedback>

          <Form.Control
            ref={passwordInputRef}
            type="password"
            placeholder="Password"
            className="mb-3"
            value={password}
            isInvalid={Boolean(fieldErrors.password)}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
          />
          <Form.Control.Feedback type="invalid" className="mb-3">
            {fieldErrors.password}
          </Form.Control.Feedback>

          <Button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Login"}
          </Button>
        </Form>

        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
