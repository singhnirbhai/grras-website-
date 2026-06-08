"use client";

import React, { memo } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Trophy, 
  UserCircle, 
  ChevronRight, 
  ChevronLeft,
  LogOut,
  Plus,
  X
} from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar = memo(({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  user,
  onLogout,
}: SidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "faculty", "student"] },
    { id: "courses", label: "Courses", icon: BookOpen, roles: ["admin"] },
    { id: "faculties", label: "Faculties", icon: Users, roles: ["admin"] },
    { id: "students", label: "Students", icon: GraduationCap, roles: ["admin", "faculty"] },
    { id: "batches", label: "Batches", icon: Layers, roles: ["admin", "faculty"] },
    { id: "quizzes", label: "Quizzes", icon: FileText, roles: ["admin", "faculty"] },
    { id: "results", label: "Results", icon: Trophy, roles: ["admin", "faculty", "student"] },
    { id: "available_exams", label: "Available Exams", icon: FileText, roles: ["student"] },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, roles: ["admin", "faculty", "student"] },
    { id: "profile", label: "Profile", icon: UserCircle, roles: ["admin", "faculty", "student"] },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      <aside
        className={`sidebar-responsive ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        style={{
          width: isSidebarOpen ? "260px" : "80px",
          backgroundColor: "hsl(var(--bg-secondary))",
          borderRight: "1px solid hsl(var(--border-color))",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width var(--transition-normal)",
          zIndex: 40,
          position: "relative"
        }}
      >
        <div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="mobile-close-btn"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "hsl(var(--text-primary))",
              padding: "4px",
              display: "none"
            }}
            title="Close menu"
          >
            <X size={20} />
          </button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px", overflow: "hidden", height: "65px", width: "100%" }}>
            {isSidebarOpen ? (
              <img 
                src="/logos/Grras logo Black.png" 
                alt="Grras Unified" 
                style={{ height: "60px", width: "auto", objectFit: "contain" }} 
              />
            ) : (
              <img 
                src="/logos/Grras logo Black.png" 
                alt="Grras Unified" 
                style={{ height: "36px", width: "36px", objectFit: "contain" }} 
              />
            )}
          </div>

          {/* Menu Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    backgroundColor: isActive ? "hsl(var(--primary-light))" : "transparent",
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                    width: "100%",
                    textAlign: "left",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  {isSidebarOpen && <span style={{ fontWeight: isActive ? 700 : 500, fontSize: "14px" }}>{item.label}</span>}
                  {isActive && isSidebarOpen && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={onLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: "none",
              backgroundColor: "transparent",
              color: "hsl(var(--danger))",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              transition: "var(--transition-fast)",
            }}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span style={{ fontWeight: 600, fontSize: "14px" }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Desktop Centered Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="desktop-toggle-btn"
        style={{
          position: "fixed",
          top: "50%",
          transform: "translateY(-50%)",
          left: isSidebarOpen ? "244px" : "64px",
          transition: "left var(--transition-normal)",
          backgroundColor: "hsl(var(--bg-secondary))",
          border: "1px solid hsl(var(--border-color))",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 950,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft size={16} style={{ color: "hsl(var(--primary))" }} /> : <ChevronRight size={16} style={{ color: "hsl(var(--primary))" }} />}
      </button>
    </>
  );
});
