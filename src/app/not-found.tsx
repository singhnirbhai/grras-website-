"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "24px",
      textAlign: "center",
      backgroundColor: "hsl(var(--bg-primary))",
      color: "hsl(var(--text-primary))",
    }}>
      <div className="glass animate-fade-in" style={{
        padding: "48px 32px",
        borderRadius: "var(--radius-lg)",
        maxWidth: "480px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "hsl(var(--danger-light))",
          color: "hsl(var(--danger))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}>
          <AlertCircle size={32} />
        </div>
        
        <h1 style={{
          fontSize: "64px",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-2px",
          marginBottom: "8px",
          color: "hsl(var(--text-primary))"
        }}>404</h1>
        
        <h2 style={{
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "12px"
        }}>Page Not Found</h2>
        
        <p style={{
          fontSize: "14px",
          color: "hsl(var(--text-secondary))",
          lineHeight: "1.6",
          marginBottom: "32px"
        }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link href="/" className="btn-primary" style={{ textDecoration: "none", width: "100%" }}>
          <ArrowLeft size={16} /> Back to Safety
        </Link>
      </div>
    </div>
  );
}
