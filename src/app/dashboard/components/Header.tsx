"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { Menu, X, User, LogOut } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  user: any;
  onProfileClick: () => void;
  onLogout: () => void;
}

export const Header = memo(({
  isSidebarOpen,
  setIsSidebarOpen,
  user,
  onProfileClick,
  onLogout,
}: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "80px",
        backgroundColor: "hsl(var(--bg-secondary))",
        borderBottom: "1px solid hsl(var(--border-color))",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "hsl(var(--text-primary))",
        }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        ref={dropdownRef}
        style={{ position: "relative" }}
      >
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          title="Account Menu"
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>{user?.name}</div>
            <div style={{ fontSize: "11px", color: "hsl(var(--text-secondary))", textTransform: "uppercase", fontWeight: 700 }}>
              {user?.role} {user?.course && `• ${user?.course}`}
            </div>
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "hsl(var(--primary-light))",
              color: "hsl(var(--primary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0)}
          </div>
        </div>

        {isDropdownOpen && (
          <div
            className="glass animate-fade-in"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              zIndex: 100,
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              minWidth: "180px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              backgroundColor: "hsl(var(--bg-secondary))",
              border: "1px solid hsl(var(--border-color))",
              padding: "4px",
            }}
          >
            <button
              onClick={() => {
                onProfileClick();
                setIsDropdownOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "hsl(var(--text-primary))",
                borderRadius: "var(--radius-sm)",
              }}
              className="dropdown-item-hover"
            >
              <User size={14} /> Profile Settings
            </button>
            <button
              onClick={() => {
                onLogout();
                setIsDropdownOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "hsl(var(--danger))",
                borderRadius: "var(--radius-sm)",
              }}
              className="dropdown-item-hover"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
});
