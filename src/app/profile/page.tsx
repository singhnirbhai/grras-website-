"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess && data.user) {
          setUser(data.user);
          setProfileForm({ name: data.user.name, email: data.user.email || "", password: "" });
        }
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Success", "Profile updated successfully!", "success");
        // Refresh profile data
        const profileRes = await fetch("/api/auth/profile");
        const profileData = await profileRes.json();
        if (profileData.isSuccess) {
          setUser(profileData.user);
        }
      } else {
        Swal.fire("Error", data.message || "Failed to update profile", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  return (
    <DashboardLayout activeTab="profile">
      <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Profile Settings</h1>
            <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Manage and update account details.</p>
          </div>
        </div>

        <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", width: "100%", margin: "0 auto" }}>
          <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Full Name</label>
                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Email Address</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>New Password</label>
                <input type="password" placeholder="Leave blank to keep current" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} className="input-field" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Account Role</label>
                <input type="text" value={user?.role?.toUpperCase() || ""} disabled className="input-field" style={{ backgroundColor: "hsl(var(--bg-primary))" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="submit" className="btn-primary" style={{ minWidth: "140px", height: "46px" }}>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
