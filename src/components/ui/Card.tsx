import React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx("bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx("px-4 py-5 sm:px-6 border-b border-slate-200", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: CardProps) {
  return (
    <h3 className={clsx("text-base font-semibold leading-6 text-slate-900", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx("px-4 py-5 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx("px-4 py-4 sm:px-6 border-t border-slate-200", className)} {...props}>
      {children}
    </div>
  );
}
