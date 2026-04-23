import { useRef, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import FormPopup from "../../components/common/FormPopup";
import { isValidEmail } from "../../utils/validation";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    variant: "danger",
  });
  const navigate = useNavigate();
  const nameInputRef = useRef(null);
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

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
  }

  function validateForm() {
    const nextErrors = {};
    const normalizedName = form.name.trim();
    const normalizedEmail = form.email.trim().toLowerCase();
    let firstInvalidInput = null;

    if (!normalizedName) {
      nextErrors.name = "Enter your full name.";
      firstInvalidInput = nameInputRef.current;
    } else if (normalizedName.length < 2) {
      nextErrors.name = "Name should be at least 2 characters.";
      firstInvalidInput = nameInputRef.current;
    }

    if (!normalizedEmail) {
      nextErrors.email = "Enter your email address.";
      firstInvalidInput = firstInvalidInput || emailInputRef.current;
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
      firstInvalidInput = firstInvalidInput || emailInputRef.current;
    }

    if (!form.password.trim()) {
      nextErrors.password = "Create a password.";
      firstInvalidInput = firstInvalidInput || passwordInputRef.current;
    } else if (form.password.length < 8) {
      nextErrors.password = "Password should be at least 8 characters.";
      firstInvalidInput = firstInvalidInput || passwordInputRef.current;
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showPopup(Object.values(nextErrors)[0], {
        title: "Registration validation",
        variant: "warning",
      });
      firstInvalidInput?.focus();
      return null;
    }

    return {
      ...form,
      name: normalizedName,
      email: normalizedEmail,
      role: "client",
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = validateForm();
    if (!payload) {
      return;
    }

    try {
      setLoading(true);
      hidePopup();
      await registerUser(payload);

      showPopup("Account created successfully. Redirecting to login...", {
        title: "Registration complete",
        variant: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      showPopup(err?.response?.data?.error || "Registration failed.", {
        title: "Registration failed",
      });
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
        <h3>Create Account</h3>
        <p className="mt-3 text-center">Join MarketIntel today</p>

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Control
            ref={nameInputRef}
            placeholder="Name"
            className="mb-3"
            value={form.name}
            isInvalid={Boolean(fieldErrors.name)}
            onChange={(event) => updateField("name", event.target.value)}
          />
          <Form.Control.Feedback type="invalid" className="mb-3">
            {fieldErrors.name}
          </Form.Control.Feedback>

          <Form.Control
            ref={emailInputRef}
            placeholder="Email"
            className="mb-3"
            type="email"
            value={form.email}
            isInvalid={Boolean(fieldErrors.email)}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <Form.Control.Feedback type="invalid" className="mb-3">
            {fieldErrors.email}
          </Form.Control.Feedback>

          <Form.Control
            ref={passwordInputRef}
            type="password"
            placeholder="Password"
            className="mb-3"
            value={form.password}
            isInvalid={Boolean(fieldErrors.password)}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <Form.Control.Feedback type="invalid" className="mb-3">
            {fieldErrors.password}
          </Form.Control.Feedback>

          <Form.Select className="mb-3" value="client" disabled>
            <option value="client">Client</option>
          </Form.Select>

          <Button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Register"}
          </Button>
        </Form>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
