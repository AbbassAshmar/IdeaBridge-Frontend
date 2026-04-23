import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Lock, LogIn, Mail } from "lucide-react";
import AuthCard from "../components/AuthCard";
import AuthLayout from "../components/AuthLayout";
import FormMessage from "../components/FormMessage";
import InputField from "../components/InputField";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getValidationErrors } from "../services/api/client";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromPath = useMemo(
    () => location.state?.from?.pathname || "/dashboard",
    [location.state],
  );

  const validate = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
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
      const response = await login(formData);
      setMessageType("success");
      setMessage(response?.data?.message || "Logged in successfully.");
      navigate(fromPath, { replace: true });
    } catch (error) {
      const detailErrors = getValidationErrors(error);
      setErrors({
        email: detailErrors?.email?.[0] || "",
        password: detailErrors?.password?.[0] || "",
      });
      setMessageType("error");
      setMessage(getErrorMessage(error, "Unable to login."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Login to IdeaForge">
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="loginEmail"
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
            id="loginPassword"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
          />

          <button
            type="submit"
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-50 transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-80"
            disabled={isSubmitting}
          >
            <LogIn size={16} />
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <FormMessage message={message} type={messageType} />
        </form>

        <p className="mt-4 text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-300 no-underline hover:text-blue-200 hover:underline"
          >
            Register
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default LoginPage;
