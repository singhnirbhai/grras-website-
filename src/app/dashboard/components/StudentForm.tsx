"use client";

import React, { memo } from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

interface StudentFormProps {
  studentForm: {
    name: string;
    email: string;
    course: string;
    batch: string;
    password?: string;
  };
  setStudentForm: React.Dispatch<React.SetStateAction<any>>;
  formErrors: Record<string, string>;
  editingStudentId: string | null;
  batches: any[];
  user: any;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const StudentForm = memo(({
  studentForm,
  setStudentForm,
  formErrors,
  editingStudentId,
  batches,
  user,
  onSubmit,
  onCancel
}: StudentFormProps) => {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
            Name <span style={{ color: "hsl(var(--danger))" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Full Name"
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
            className="input-field"
            style={{ border: formErrors.name ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }}
          />
          {formErrors.name && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.name}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
            Email <span style={{ color: "hsl(var(--danger))" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
            className="input-field"
            style={{ border: formErrors.email ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }}
          />
          {formErrors.email && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.email}</span>}
        </div>
      </div>

      <CustomDropdown
        label="Select Batch"
        value={studentForm.batch}
        options={batches
          .filter((b) => user?.role === "admin" || b.course === user?.course)
          .map((b) => ({ label: `${b.name} (${b.course})`, value: b.name }))}
        onChange={(val) => {
          const b = batches.find((b) => b.name === val);
          setStudentForm({ ...studentForm, batch: b?.name || "", course: b?.course || "" });
        }}
        required
        error={formErrors.batch}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
          Password {!editingStudentId && <span style={{ color: "hsl(var(--danger))" }}>*</span>}
        </label>
        <input
          type="password"
          placeholder={editingStudentId ? "Leave blank to keep current" : "Password"}
          value={studentForm.password || ""}
          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
          className="input-field"
          style={{ border: formErrors.password ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }}
        />
        {formErrors.password && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.password}</span>}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1, height: "50px" }}>
          {editingStudentId ? "Save Updates" : "Register Student"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ height: "50px", padding: "0 24px" }}>
          Cancel
        </button>
      </div>
    </form>
  );
});

StudentForm.displayName = "StudentForm";
