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
      <label htmlFor={id} className="mb-2 block text-sm text-slate-300">
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
          className={`w-full rounded-xl border bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/30 ${
            Icon ? "pl-10" : ""
          } ${error ? "border-red-400" : "border-slate-700"}`}
        />
      </div>
      <p className="mt-1.5 min-h-[18px] text-xs text-red-400">{error || ""}</p>
    </div>
  );
}

export default InputField;
