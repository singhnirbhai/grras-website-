"use client";

import React, { memo } from "react";

interface CourseFormProps {
  courseForm: {
    name: string;
    description: string;
  };
  setCourseForm: React.Dispatch<React.SetStateAction<any>>;
  formErrors: Record<string, string>;
  editingCourseId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const CourseForm = memo(({
  courseForm,
  setCourseForm,
  formErrors,
  editingCourseId,
  onSubmit,
  onCancel
}: CourseFormProps) => {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
          Course Name <span style={{ color: "hsl(var(--danger))" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Course Name"
          value={courseForm.name}
          onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
          className="input-field"
          style={{ border: formErrors.name ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }}
        />
        {formErrors.name && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.name}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Description</label>
        <textarea
          placeholder="Describe course..."
          value={courseForm.description}
          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
          className="input-field"
          style={{ height: "120px", resize: "none" }}
        />
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1, height: "50px" }}>
          {editingCourseId ? "Save Updates" : "Create Course"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ height: "50px", padding: "0 24px" }}>
          Cancel
        </button>
      </div>
    </form>
  );
});

CourseForm.displayName = "CourseForm";
