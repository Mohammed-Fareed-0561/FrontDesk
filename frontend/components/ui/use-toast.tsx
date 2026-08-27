"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { type ToastProps } from "@/components/ui/toast";

const toastTimeout = 5000;

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export type ToastOptions = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
};

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (toast: ToastOptions) => string;
  dismiss: (id: string) => void;
  defaultOptions: ToastOptions;
}>({
  toasts: [],
  addToast: () => "",
  dismiss: () => {},
  defaultOptions: {},
});

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return {
    toasts: context.toasts,
    toast: (opts: ToastOptions) => context.addToast(opts),
    dismiss: context.dismiss,
    defaultOptions: context.defaultOptions,
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (opts: ToastOptions) => {
      const id = Math.random().toString(36).slice(2, 11);
      const toast: Toast = {
        id,
        title: opts.title,
        description: opts.description,
        action: opts.action,
      };
      setToasts((prev) => [...prev, toast]);

      if (opts.duration !== 0) {
        setTimeout(() => dismiss(id), opts.duration ?? toastTimeout);
      }
      return id;
    },
    [dismiss]
  );

  const value = {
    toasts,
    addToast,
    dismiss,
    defaultOptions: {},
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export type { ToastProps };
