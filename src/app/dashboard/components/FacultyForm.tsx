"use client";

import React, { memo, useState } from "react";
import { X, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

interface FacultyFormProps {
  facultyForm: any;
  setFacultyForm: (form: any) => void;
  formErrors: Record<string, string>;
  editingFacultyId: string | null;
  courses: any[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const FacultyForm = memo(({
  facultyForm,
  setFacultyForm,
  formErrors,
  editingFacultyId,
  courses,
  onSubmit,
  onCancel,
}: FacultyFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Name <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
          <input 
            type="text" 
            placeholder="Name" 
            value={facultyForm.name} 
            onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })} 
            className="input-field" 
            style={{ border: formErrors.name ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} 
          />
          {formErrors.name && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.name}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Email <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
          <input 
            type="email" 
            placeholder="Email" 
            value={facultyForm.email} 
            onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })} 
            className="input-field" 
            style={{ border: formErrors.email ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} 
          />
          {formErrors.email && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.email}</span>}
        </div>
        <CustomDropdown 
          label="Assigned Course"
          value={facultyForm.course}
          options={courses.map(c => ({ label: c.name, value: c.name }))}
          onChange={(val) => setFacultyForm({ ...facultyForm, course: val })}
          required
          error={formErrors.course}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Password {!editingFacultyId && <span style={{ color: "hsl(var(--danger))" }}>*</span>}</label>
          <div style={{ position: "relative", width: "100%" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder={editingFacultyId ? "Leave blank to keep current" : "Password"} 
              value={facultyForm.password} 
              onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })} 
              className="input-field" 
              style={{ paddingRight: "72px", border: formErrors.password ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} 
            />
            <button
              type="button"
              onClick={() => {
                const newPass = generateRandomPassword();
                setFacultyForm({ ...facultyForm, password: newPass });
                setShowPassword(true);
              }}
              title="Auto-generate secure password"
              style={{
                position: "absolute",
                right: "42px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "hsl(var(--primary))",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
            >
              <Sparkles size={16} />
            </button>
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
                padding: "4px",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formErrors.password && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.password}</span>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-secondary" 
          style={{ minWidth: "120px", height: "46px" }}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" style={{ minWidth: "140px", height: "46px" }}>
          {editingFacultyId ? "Save Updates" : "Create Account"}
        </button>
      </div>
    </form>
  );
});

