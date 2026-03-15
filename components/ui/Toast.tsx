type ToastProps = {
  message: string;
  tone?: "error" | "success";
};

const toneClasses: Record<NonNullable<ToastProps["tone"]>, string> = {
  error: "border-rose-500/20 bg-rose-500/10 text-rose-100",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
};

export function Toast({ message, tone = "success" }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`rounded-lg border p-5 text-sm leading-7 shadow-md ${toneClasses[tone]}`}
      role="status"
    >
      {message}
    </div>
  );
}
