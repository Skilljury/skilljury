type ToastProps = {
  message: string;
  tone?: "error" | "success";
};

const toneClasses: Record<NonNullable<ToastProps["tone"]>, string> = {
  error: "border-rose-200 bg-rose-50/90 text-rose-800",
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
};

export function Toast({ message, tone = "success" }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`rounded-[1.5rem] border p-5 text-sm leading-7 shadow-[0_20px_55px_rgba(15,23,42,0.05)] ${toneClasses[tone]}`}
      role="status"
    >
      {message}
    </div>
  );
}
