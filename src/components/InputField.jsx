function InputField({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  icon,
}) {
  const Icon = icon;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm text-content-tertiary">
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
            <Icon size={16} />
          </span>
        ) : null}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`focus-ring w-full rounded-card border bg-ui-input px-3 py-3 text-base text-content-primary outline-none transition placeholder:text-content-tertiary hover:bg-ui-input-hover focus:border-ui-border-focus focus:ring-2 focus:ring-accent-400/30 ${
            Icon ? "pl-10" : ""
          } ${error ? "border-danger" : "border-ui-border"}`}
        />
      </div>
      <p className="mt-1.5 min-h-[18px] text-xs text-danger">{error || ""}</p>
    </div>
  );
}

export default InputField;
