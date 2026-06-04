"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface CustomMultiSelectProps {
  label: string;
  selected?: string[];
  options: { label: string; value: string }[];
  onChange: (vals: string[]) => void;
  error?: string;
}

export const CustomMultiSelect = ({
  label,
  selected = [],
  options,
  onChange,
  error,
}: CustomMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Safe fallback to prevent undefined map issues
  const selectedList = selected || [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    const newSelected = selectedList.includes(value)
      ? selectedList.filter((v) => v !== value)
      : [...selectedList, value];
    onChange(newSelected);
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selectedList.filter((v) => v !== value));
  };

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "4px", position: "relative", width: "100%" }}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>{label}</label>
      
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: error ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          minHeight: "44px",
          backgroundColor: "hsl(var(--bg-secondary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          gap: "8px",
          userSelect: "none",
          transition: "var(--transition-fast)",
        }}
        className="dropdown-item-hover"
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
          {selectedList.length === 0 ? (
            <span style={{ fontSize: "14px", color: "hsl(var(--text-muted))" }}>-- Select options --</span>
          ) : (
            selectedList.map((val) => {
              const labelText = options.find((opt) => opt.value === val)?.label || val;
              return (
                <span
                  key={val}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "hsl(var(--primary-light))",
                    color: "hsl(var(--primary))",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {labelText}
                  <X
                    size={12}
                    onClick={(e) => handleRemove(e, val)}
                    style={{ cursor: "pointer", display: "inline-flex" }}
                  />
                </span>
              );
            })
          )}
        </div>
        <ChevronDown size={18} style={{ color: "hsl(var(--text-secondary))", transition: "var(--transition-fast)", transform: isOpen ? "rotate(180deg)" : "none" }} />
      </div>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
            backgroundColor: "hsl(var(--bg-secondary))",
            border: "1px solid hsl(var(--border-color))",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            zIndex: 100,
            maxHeight: "220px",
            overflowY: "auto",
            padding: "8px",
          }}
          className="glass"
        >
          {options.length === 0 ? (
            <p style={{ fontSize: "13px", color: "hsl(var(--text-muted))", textAlign: "center", padding: "12px" }}>No options available</p>
          ) : (
            options.map((opt) => {
              const isChecked = selectedList.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => handleToggle(opt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "var(--transition-fast)",
                    backgroundColor: isChecked ? "hsla(var(--primary-light) / 0.5)" : "transparent",
                    color: isChecked ? "hsl(var(--primary))" : "hsl(var(--text-primary))",
                    fontWeight: isChecked ? 700 : 500,
                  }}
                  className="dropdown-item-hover"
                >
                  <span>{opt.label}</span>
                  {isChecked && <Check size={16} style={{ color: "hsl(var(--primary))" }} />}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "4px" }}>{error}</span>}
    </div>
  );
};
