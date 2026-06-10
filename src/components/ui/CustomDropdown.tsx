"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface CustomDropdownProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  openUpward?: boolean;
}

export const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  required = false,
  error,
  disabled = false,
  openUpward = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }} ref={dropdownRef}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
        {label} {required && <span style={{ color: "hsl(var(--danger))" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="input-field"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: disabled ? "not-allowed" : "pointer",
            border: error ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))",
            backgroundColor: disabled ? "hsl(var(--bg-primary))" : "hsl(var(--bg-secondary))",
            opacity: disabled ? 0.6 : 1,
            padding: "10px 12px",
          }}
        >
          <span style={{ color: value ? "inherit" : "hsl(var(--text-muted))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: "4px" }}>
            {options.find((opt) => opt.value === value)?.label || placeholder}
          </span>
          {!disabled && (
            <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }} />
          )}
        </div>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: openUpward ? "auto" : "100%",
              bottom: openUpward ? "100%" : "auto",
              left: openUpward ? "auto" : 0,
              right: 0,
              minWidth: "100%",
              width: "max-content",
              marginTop: openUpward ? "0px" : "8px",
              marginBottom: openUpward ? "8px" : "0px",
              zIndex: 1000,
              maxHeight: "260px",
              overflowY: "auto",
              borderRadius: "var(--radius-md)",
              padding: "8px",
              boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              backgroundColor: "hsl(var(--bg-secondary))",
              border: "1px solid hsl(var(--border-color))",
            }}
          >
            <div style={{ position: "relative", marginBottom: "8px" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "hsl(var(--text-muted))",
                }}
                size={14}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 32px",
                  fontSize: "13px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid hsl(var(--border-color))",
                  outline: "none",
                  backgroundColor: "hsl(var(--bg-primary))",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {filteredOptions.length === 0 ? (
              <div style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "hsl(var(--text-muted))" }}>
                No matches found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "13px",
                    backgroundColor: value === opt.value ? "hsl(var(--primary-light))" : "transparent",
                    color: value === opt.value ? "hsl(var(--primary))" : "hsl(var(--text-primary))",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(var(--primary))";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    const isSelected = value === opt.value;
                    e.currentTarget.style.backgroundColor = isSelected ? "hsl(var(--primary-light))" : "transparent";
                    e.currentTarget.style.color = isSelected ? "hsl(var(--primary))" : "hsl(var(--text-primary))";
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "2px" }}>{error}</span>}
    </div>
  );
};
