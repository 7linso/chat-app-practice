import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  text?: string;
};

export default function OverlayLoader({ open, text = "Loading…" }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[1px] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/90 p-6 shadow-lg">
        <svg
          className="h-12 w-12 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 0 1 8-8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-sm text-gray-700">{text}</span>
      </div>
    </div>,
    document.body,
  );
}
