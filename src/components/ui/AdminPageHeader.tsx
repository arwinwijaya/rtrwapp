"use client";

import React from "react";
import { Button } from "./Button";
import { Plus } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function AdminPageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon: Icon
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 shrink-0"
        >
          {Icon ? <Icon className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
