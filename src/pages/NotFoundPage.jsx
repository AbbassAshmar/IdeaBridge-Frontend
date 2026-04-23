import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function NotFoundPage() {
  return (
    <AuthLayout>
      <section className="w-full max-w-[460px] rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55)] md:p-7">
        <h1 className="mb-3 text-2xl font-semibold text-slate-100">
          Page not found
        </h1>
        <p className="mb-4 text-slate-300">
          The page you requested does not exist.
        </p>
        <Link
          className="font-semibold text-blue-300 no-underline hover:text-blue-200 hover:underline"
          to="/login"
        >
          Back to login
        </Link>
      </section>
    </AuthLayout>
  );
}

export default NotFoundPage;
