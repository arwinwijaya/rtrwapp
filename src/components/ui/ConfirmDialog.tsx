"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  isLoading = false,
  variant = "danger"
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${
            variant === "danger" ? "bg-red-50 text-red-600" :
            variant === "warning" ? "bg-amber-50 text-amber-600" :
            "bg-blue-50 text-blue-600"
          }`}>
            <AlertTriangle size={24} />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pt-1">
            {message}
          </p>
        </div>
        
        <div className="flex items-center gap-3 justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
            className="text-slate-600"
          >
            {cancelLabel}
          </Button>
          <Button 
            onClick={onConfirm} 
            isLoading={isLoading}
            className={
              variant === "danger" ? "bg-red-600 hover:bg-red-700 shadow-red-100" :
              variant === "warning" ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100" :
              "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
