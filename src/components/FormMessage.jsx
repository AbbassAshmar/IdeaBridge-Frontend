function FormMessage({ message, type = "success" }) {
  if (!message) {
    return <p className="mt-3 min-h-[20px] text-sm" />;
  }

  return (
    <p
      className={`mt-3 min-h-[20px] text-sm ${type === "error" ? "text-red-400" : "text-emerald-400"}`}
    >
      {message}
    </p>
  );
}

export default FormMessage;
