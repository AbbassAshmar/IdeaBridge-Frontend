function AuthCard({ title, children }) {
  return (
    <section
      className="w-full max-w-[460px] rounded-card border border-ui-border/50 bg-gradient-to-br from-surface-raised/95 to-surface-base/95 p-6 shadow-card-light dark:shadow-card-dark md:p-7"
      aria-live="polite"
    >
      <h1 className="mb-6 text-[clamp(1.35rem,1.6vw,1.6rem)] font-semibold leading-tight text-content-primary">
        {title}
      </h1>
      {children}
    </section>
  );
}

export default AuthCard;
