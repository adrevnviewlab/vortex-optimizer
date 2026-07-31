"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn, springConfig } from "../lib/cn";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within Dialog");
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      setInternalOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>
  );
}

export function DialogTrigger({
  children,
  asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = useDialogContext();

  if (asChild && typeof children === "object" && children !== null) {
    return children;
  }

  return (
    <button type="button" onClick={() => setOpen(true)} className="cursor-pointer">
      {children}
    </button>
  );
}

export interface DialogContentProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function DialogContent({
  title,
  description,
  children,
  className,
  footer,
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-[var(--surface-overlay)]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={springConfig}
            className={cn(
              "relative z-10 w-full max-w-md rounded-[var(--card-radius)]",
              "border border-[var(--border-default)] bg-[var(--surface-raised)]",
              "shadow-[var(--shadow-lg)] outline-none",
              className
            )}
          >
            <div className="flex items-start justify-between border-b border-[var(--border-default)] px-5 py-4">
              <div>
                <h2
                  id={titleId}
                  className="text-[var(--font-h2)] font-semibold tracking-[var(--tracking-tight)]"
                >
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-[var(--button-radius)] p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            {children && <div className="px-5 py-4">{children}</div>}
            {footer && (
              <div className="flex justify-end gap-2 border-t border-[var(--border-default)] px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DialogClose({ children }: { children: ReactNode }) {
  const { setOpen } = useDialogContext();
  return (
    <button type="button" onClick={() => setOpen(false)}>
      {children}
    </button>
  );
}
