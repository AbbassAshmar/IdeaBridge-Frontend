import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import AuthCard from "../components/AuthCard";
import AuthLayout from "../components/AuthLayout";
import FormMessage from "../components/FormMessage";
import InputField from "../components/InputField";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getValidationErrors } from "../services/api/client";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!["user", "developer"].includes(formData.role)) {
      nextErrors.role = "Please choose a valid role.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      setMessageType("error");
      setMessage("Please fix the highlighted errors.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await register({
        username: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setMessageType("success");
      setMessage(response?.data?.message || "Registered successfully.");
      navigate("/ideas", { replace: true });
    } catch (error) {
      const detailErrors = getValidationErrors(error);
      setErrors({
        name: detailErrors?.username?.[0] || "",
        email: detailErrors?.email?.[0] || "",
        password: detailErrors?.password?.[0] || "",
        confirmPassword: "",
        role: detailErrors?.role?.[0] || "",
      });
      setMessageType("error");
      setMessage(getErrorMessage(error, "Unable to register."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Register to IdeaForge">
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="registerName"
            name="name"
            label="Name"
            placeholder="Your full name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
          />

          <InputField
            id="registerEmail"
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
          />

          <InputField
            id="registerPassword"
            name="password"
            label="Password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
          />

          <InputField
            id="registerConfirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={Lock}
          />

          <div className="mb-4">
            <p className="mb-2 block text-sm text-content-tertiary">Role</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    role: "user",
                  }));
                  setErrors((prev) => ({ ...prev, role: "" }));
                }}
                className={`inline-flex items-center rounded-pill border px-4 py-2 text-sm font-semibold transition ${
                  formData.role === "user"
                    ? "border-accent-400 bg-accent-400/20 text-accent-600 dark:text-accent-200"
                    : "border-ui-border text-content-tertiary hover:text-content-secondary"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    role: "developer",
                  }));
                  setErrors((prev) => ({ ...prev, role: "" }));
                }}
                className={`inline-flex items-center rounded-pill border px-4 py-2 text-sm font-semibold transition ${
                  formData.role === "developer"
                    ? "border-accent-400 bg-accent-400/20 text-accent-600 dark:text-accent-200"
                    : "border-ui-border text-content-tertiary hover:text-content-secondary"
                }`}
              >
                Developer
              </button>
            </div>
            <p className="mt-1.5 min-h-[18px] text-xs text-danger">
              {errors.role || ""}
            </p>
          </div>

          <button
            type="submit"
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-card bg-gradient-to-br from-accent-400 to-accent-500 px-4 py-3 text-sm font-semibold text-content-inverse transition hover:-translate-y-0.5 hover:shadow-glow-accent disabled:cursor-not-allowed disabled:opacity-80"
            disabled={isSubmitting}
          >
            <UserPlus size={16} />
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          <FormMessage message={message} type={messageType} />
        </form>

        <p className="mt-4 text-sm text-content-tertiary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-accent-400 no-underline hover:text-accent-300 hover:underline"
          >
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default RegisterPage;
