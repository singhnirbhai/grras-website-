"use client";

import React, { memo } from "react";

interface ProfileViewProps {
  user: any;
  profileForm: {
    name: string;
    email: string;
    password?: string;
  };
  setProfileForm: React.Dispatch<React.SetStateAction<any>>;
  onUpdateProfile: (e: React.FormEvent) => void;
}

export const ProfileView = memo(({
  user,
  profileForm,
  setProfileForm,
  onUpdateProfile
}: ProfileViewProps) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "start" }} className="animate-fade-in">
      {/* Left: View Profile details */}
      <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Account Specifications</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "12px" }}>
            <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Name</span>
            <span style={{ fontWeight: 700 }}>{user?.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "12px" }}>
            <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Email Address</span>
            <span style={{ fontWeight: 700 }}>{user?.email}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "12px" }}>
            <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>User Role</span>
            <span style={{ fontWeight: 700, textTransform: "uppercase", color: "hsl(var(--primary))" }}>{user?.role}</span>
          </div>
          {user?.course && (
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "12px" }}>
              <span style={{ color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Assigned Course</span>
              <span style={{ fontWeight: 700 }}>{user.course}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Edit profile form */}
      <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "32px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Change Credentials</h2>
        <form onSubmit={onUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Name</label>
            <input
              type="text"
              placeholder="Profile Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Email Address</label>
            <input
              type="email"
              placeholder="Email Address"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>New Password (Leave blank to keep current)</label>
            <input
              type="password"
              placeholder="Enter new password (optional)"
              value={profileForm.password || ""}
              onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%", height: "46px", marginTop: "8px" }}>
            Save Account Updates
          </button>
        </form>
      </div>
    </div>
  );
});

ProfileView.displayName = "ProfileView";
