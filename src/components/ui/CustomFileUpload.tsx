"use client";

import React from "react";
import { Upload } from "lucide-react";

interface CustomFileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  fileName: string;
  error?: string;
  required?: boolean;
}

export const CustomFileUpload = ({
  label,
  onChange,
  fileName,
  error,
  required = false,
}: CustomFileUploadProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
        {label} {required && <span style={{ color: "hsl(var(--danger))" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.json"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
            zIndex: 10,
          }}
        />
        <div
          className="input-field"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            border: error ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))",
            backgroundColor: "hsl(var(--bg-secondary))",
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              backgroundColor: "hsl(var(--primary-light))",
              color: "hsl(var(--primary))",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Upload size={14} /> Browse
          </div>
          <span style={{ fontSize: "13px", color: fileName ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fileName || "Choose file (Excel, CSV, JSON)"}
          </span>
        </div>
      </div>
      {error && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "2px" }}>{error}</span>}
    </div>
  );
};
