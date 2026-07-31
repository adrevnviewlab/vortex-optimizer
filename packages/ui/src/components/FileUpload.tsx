"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "../lib/cn";

export interface FileUploadProps {
  accept?: string;
  onFile: (content: string, fileName: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = ".csv,text/csv",
  onFile,
  disabled = false,
  className,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv") && file.type !== "text/csv") return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setFileName(file.name);
        onFile(content, file.name);
      };
      reader.readAsText(file);
    },
    [onFile],
  );

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-[var(--card-radius)] border-2 border-dashed px-6 py-10 transition-colors",
        dragging
          ? "border-[var(--brand-primary)] bg-[var(--brand-primary-muted)]"
          : "border-[var(--border-strong)] bg-[var(--surface-sunken)]",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <Upload size={32} className="text-[var(--text-tertiary)]" strokeWidth={1.5} />
      <p className="mt-3 text-[var(--font-body-sm)] font-medium text-[var(--text-primary)]">
        Drag & drop CSV file here
      </p>
      <p className="mt-1 text-[var(--font-caption)] text-[var(--text-tertiary)]">
        or click to browse
      </p>
      {fileName && (
        <p className="mt-2 text-[var(--font-caption)] text-[var(--brand-primary)]">{fileName}</p>
      )}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Upload CSV file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
