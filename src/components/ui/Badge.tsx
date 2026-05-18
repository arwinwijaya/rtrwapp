import React from "react";
import { clsx } from "clsx";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline" | "primary";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase tracking-wider";
  
  const variants = {
    default: "bg-slate-50 text-slate-600 ring-slate-500/10",
    primary: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
    danger: "bg-red-50 text-red-700 ring-red-600/10",
    info: "bg-blue-50 text-blue-700 ring-blue-700/10",
    outline: "bg-transparent text-slate-500 ring-slate-200",
  };

  return (
    <span className={clsx(baseClasses, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
