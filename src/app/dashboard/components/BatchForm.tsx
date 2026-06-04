"use client";

import React, { memo } from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { CustomMultiSelect } from "@/components/ui/CustomMultiSelect";

interface BatchFormProps {
  batchForm: {
    name: string;
    course: string;
    faculty: string;
    students: string[];
  };
  setBatchForm: React.Dispatch<React.SetStateAction<any>>;
  formErrors: Record<string, string>;
  editingBatchId: string | null;
  courses: any[];
  faculties: any[];
  students: any[];
  user: any;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const BatchForm = memo(({
  batchForm,
  setBatchForm,
  formErrors,
  editingBatchId,
  courses,
  faculties,
  students,
  user,
  onSubmit,
  onCancel
}: BatchFormProps) => {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
          Batch Name <span style={{ color: "hsl(var(--danger))" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Batch Name (e.g. Python-Evening)"
          value={batchForm.name}
          onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
          className="input-field"
          style={{ border: formErrors.name ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }}
        />
        {formErrors.name && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.name}</span>}
      </div>

      {user?.role === "admin" && (
        <CustomDropdown
          label="Assigned Course"
          value={batchForm.course}
          options={courses.map((c) => ({ label: c.name, value: c.name }))}
          onChange={(val) => setBatchForm({ ...batchForm, course: val, faculty: "", students: [] })}
          required
          error={formErrors.course}
        />
      )}

      {batchForm.course && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          <CustomDropdown
            label="Assign Faculty"
            value={batchForm.faculty}
            options={faculties
              .filter((f) => f.course === batchForm.course)
              .map((f) => ({ label: `${f.name} (${f.email})`, value: f.email }))}
            onChange={(val) => setBatchForm({ ...batchForm, faculty: val })}
            placeholder="-- Select Faculty (Optional) --"
            error={formErrors.faculty}
          />
          <CustomMultiSelect
            label="Assign Students"
            selected={batchForm.students}
            options={students
              .filter((s) => s.course === batchForm.course)
              .map((s) => ({ label: `${s.name} (${s.userId})`, value: s.userId }))}
            onChange={(vals) => setBatchForm({ ...batchForm, students: vals })}
            error={formErrors.students}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1, height: "50px" }}>
          {editingBatchId ? "Save Updates" : "Create Batch"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ height: "50px", padding: "0 24px" }}>
          Cancel
        </button>
      </div>
    </form>
  );
});

BatchForm.displayName = "BatchForm";
