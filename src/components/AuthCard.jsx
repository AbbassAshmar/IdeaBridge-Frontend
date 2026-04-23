function AuthCard({ title, children }) {
  return (
    <section
      className="w-full max-w-[460px] rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55)] md:p-7"
      aria-live="polite"
    >
      <h1 className="mb-6 text-[clamp(1.35rem,1.6vw,1.6rem)] font-semibold leading-tight text-slate-100">
        {title}
      </h1>
      {children}
    </section>
  );
}

export default AuthCard;
