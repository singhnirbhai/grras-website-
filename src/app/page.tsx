"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, BookOpen, ShieldAlert, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "faculty" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"login" | "forgot">("login");

  useEffect(() => {
    // Check if user is already logged in
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess && data.user) {
          router.push("/dashboard");
        }
      })
      .catch((err) => console.log("Not logged in"));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in all fields",
        confirmButtonColor: "hsl(var(--primary))",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (data.isSuccess) {
        Swal.fire({
          icon: "success",
          title: "Logged In",
          text: data.message || "Successfully logged in!",
          timer: 1500,
          showConfirmButton: false,
        });
        router.push("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: data.message || "Invalid credentials",
          confirmButtonColor: "hsl(var(--danger))",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during authentication",
        confirmButtonColor: "hsl(var(--danger))",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter your email address",
        confirmButtonColor: "hsl(var(--primary))",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (data.isSuccess) {
        Swal.fire({
          icon: "success",
          title: "Instructions Sent",
          text: data.message || "Please check your email.",
          confirmButtonColor: "hsl(var(--primary))",
        });
        setView("login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: data.message || "User account not found with the specified role.",
          confirmButtonColor: "hsl(var(--danger))",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred. Please try again.",
        confirmButtonColor: "hsl(var(--danger))",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <img 
              src="/logos/Grras logo Black.png" 
              alt="Grras Solutions Logo" 
              style={{ height: "55px", width: "auto", objectFit: "contain" }} 
            />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px" }}>
            Grras Solutions
          </h1>
          {view !== "login" && (
            <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>
              Reset Account Password
            </p>
          )}
        </div>

        {/* Role Selector Tabs */}
        <div
          className="login-role-tabs"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            backgroundColor: "hsl(var(--primary-light))",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            marginBottom: "32px",
          }}
        >
          {(["student", "faculty", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                padding: "10px 0",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                textTransform: "capitalize",
                backgroundColor: role === r ? "hsl(var(--bg-secondary))" : "transparent",
                color: role === r ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                boxShadow: role === r ? "0 4px 10px rgba(0, 0, 0, 0.05)" : "none",
                transition: "var(--transition-fast)",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {view === "login" ? (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label
                htmlFor="email"
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
                Email Address
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
                  <User size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "42px" }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "hsl(var(--text-secondary))",
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "hsl(var(--primary))",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </button>
              </div>
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
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "42px", paddingRight: "42px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "hsl(var(--text-muted))",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label
                htmlFor="forgot-email"
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
                Registered Email Address
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
                  <User size={18} />
                </span>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Send Reset Link <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setView("login")}
              style={{ width: "100%", height: "48px" }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </form>
        )}


      </div>
    </div>
  );
}
