import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function NotFoundPage() {
  return (
    <AuthLayout>
      <section className="w-full max-w-[460px] rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark md:p-7">
        <h1 className="mb-3 text-2xl font-semibold text-content-primary">
          Page not found
        </h1>
        <p className="mb-4 text-content-tertiary">
          The page you requested does not exist.
        </p>
        <Link
          className="font-semibold text-accent-400 no-underline hover:text-accent-300 hover:underline"
          to="/login"
        >
          Back to login
        </Link>
      </section>
    </AuthLayout>
  );
}

export default NotFoundPage;
