"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, BookOpen, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const role = searchParams.get("role");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !role) {
      Swal.fire("Error", "Required reset token or role parameter is missing.", "error");
      return;
    }

    if (password.length < 6) {
      Swal.fire("Warning", "Password must be at least 6 characters long.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token, role }),
      });

      const data = await res.json();

      if (data.isSuccess) {
        Swal.fire({
          icon: "success",
          title: "Password Updated",
          text: data.message || "Your password has been reset successfully.",
          confirmButtonColor: "hsl(var(--primary))",
        }).then(() => {
          router.push("/");
        });
      } else {
        Swal.fire("Error", data.message || "Failed to reset password.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !role) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "hsl(var(--danger))", fontWeight: 700, marginBottom: "16px" }}>
          Invalid or incomplete password reset link.
        </p>
        <button className="btn-secondary" onClick={() => router.push("/")}>
          <ArrowLeft size={16} /> Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label
          htmlFor="new-password"
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "hsl(var(--text-secondary))",
            marginBottom: "6px",
            display: "block",
          }}
        >
          New Password
        </label>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "hsl(var(--text-muted))",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Lock size={18} />
          </span>
          <input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "42px" }}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "hsl(var(--text-secondary))",
            marginBottom: "6px",
            display: "block",
          }}
        >
          Confirm Password
        </label>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "hsl(var(--text-muted))",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Lock size={18} />
          </span>
          <input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "42px" }}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={isLoading}
        style={{ width: "100%", height: "48px", marginTop: "10px" }}
      >
        {isLoading ? (
          <Loader2 className="animate-pulse-soft" size={18} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <>
            Reset Password <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "radial-gradient(circle at 10% 20%, rgba(30, 80, 255, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(20, 200, 100, 0.06) 0%, transparent 40%)",
        position: "relative",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.05)",
          animation: "fadeIn 0.6s ease-out forwards",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "hsl(var(--primary-light))",
              color: "hsl(var(--primary))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <BookOpen size={30} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px" }}>
            Set New Password
          </h1>
          <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px", marginBottom: "20px" }}>
            Enter and verify your new account password credentials
          </p>
        </div>

        <Suspense fallback={
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: "0 auto 10px" }} />
            <p>Loading parameters...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
