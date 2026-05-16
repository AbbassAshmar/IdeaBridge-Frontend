function FormMessage({ message, type = "success" }) {
  if (!message) {
    return <p className="mt-3 min-h-[20px] text-sm" />;
  }

  return (
    <p
      className={`mt-3 min-h-[20px] text-sm font-medium ${type === "error" ? "text-danger" : "text-success"}`}
    >
      {message}
    </p>
  );
}

export default FormMessage;
