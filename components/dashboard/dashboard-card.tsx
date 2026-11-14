
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface DashboardCardProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function DashboardCard({
  children,
  className = "",
  type = "button",
  ...props
}: DashboardCardProps) {
  return (
    <button
      type={type}
      className={`
        group w-full rounded-xl
        border border-slate-200
        bg-white/75 p-5 text-left
        backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-1
        hover:border-slate-300
        hover:bg-white/95
        hover:shadow-lg hover:shadow-slate-900/[0.05]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-slate-500
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
