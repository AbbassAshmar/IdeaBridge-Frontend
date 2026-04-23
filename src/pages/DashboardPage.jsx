import AuthLayout from "../components/AuthLayout";
import { Lightbulb } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthLayout>
      <section className="w-full max-w-[460px] rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55)] md:p-7">
        <h1 className="mb-4 inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <Lightbulb size={22} className="text-amber-300" />
          Welcome to IdeaForge
        </h1>
        <p className="text-slate-300">
          You are logged in as {user?.email || "an authenticated user"}.
        </p>
      </section>
    </AuthLayout>
  );
}

export default DashboardPage;
