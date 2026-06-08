"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Sidebar } from "@/app/dashboard/components/Sidebar";
import { Header } from "@/app/dashboard/components/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "faculty" | "student";
  course?: string;
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("auth_user");
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_open");
      if (saved !== null) return saved === "true";
      return window.innerWidth > 1024;
    }
    return true;
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("auth_user");
    }
    return true;
  });

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess && data.user) {
          setUser(data.user);
          sessionStorage.setItem("auth_user", JSON.stringify(data.user));
        } else {
          sessionStorage.removeItem("auth_user");
          router.push("/");
        }
      })
      .catch(() => {
        sessionStorage.removeItem("auth_user");
        router.push("/");
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        const saved = localStorage.getItem("sidebar_open");
        setIsSidebarOpen(saved !== null ? saved === "true" : true);
      }
    };
    
    // Set initial
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = (open: boolean) => {
    setIsSidebarOpen(open);
    if (typeof window !== "undefined" && window.innerWidth > 1024) {
      localStorage.setItem("sidebar_open", open ? "true" : "false");
    }
  };

  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--primary))",
      cancelButtonColor: "hsl(var(--text-muted))",
    });

    if (confirm.isConfirmed) {
      sessionStorage.removeItem("auth_user");
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "hsl(var(--bg-primary))" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 className="animate-pulse-soft" size={48} style={{ color: "hsl(var(--primary))", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "hsl(var(--text-secondary))" }}>Securing portal tunnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "hsl(var(--bg-primary))" }}>
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 900,
            display: "none"
          }}
        />
      )}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={handleToggleSidebar} 
        activeTab={activeTab} 
        setActiveTab={(tabId) => {
          // In top-level routes routing, we push URL directly:
          router.push(`/${tabId}`);
        }} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Panel Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", height: "100vh" }}>
        <Header 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={handleToggleSidebar} 
          user={user} 
          onProfileClick={() => {
            router.push("/profile");
          }} 
          onLogout={handleLogout}
        />

        {/* Dashboard Body views */}
        <div className="main-content-responsive" style={{ flex: 1, padding: "32px", width: "100%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
