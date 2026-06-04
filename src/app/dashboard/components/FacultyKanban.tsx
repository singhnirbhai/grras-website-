"use client";

import React, { memo } from "react";
import { Edit3, Trash2, BookOpen } from "lucide-react";

interface FacultyKanbanProps {
  faculties: any[];
  onEdit: (faculty: any) => void;
  onDelete: (id: string) => void;
}

export const FacultyKanban = memo(({
  faculties,
  onEdit,
  onDelete,
}: FacultyKanbanProps) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
      {faculties.length === 0 ? (
        <div className="glass" style={{ padding: "40px", textAlign: "center", color: "hsl(var(--text-muted))", gridColumn: "1 / -1" }}>No instructors found</div>
      ) : (
        faculties.map((f) => (
          <div key={f._id} className="glass" style={{ padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid hsl(var(--border-color))", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "hsl(var(--primary-light))", color: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 800 }}>
                {f.name?.charAt(0)}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => onEdit(f)} style={{ padding: "6px", color: "hsl(var(--primary))", background: "none", border: "none", cursor: "pointer" }} title="Edit"><Edit3 size={16} /></button>
                <button onClick={() => onDelete(f._id)} style={{ padding: "6px", color: "hsl(var(--danger))", background: "none", border: "none", cursor: "pointer" }} title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{f.name}</h3>
            <p style={{ fontSize: "13px", color: "hsl(var(--text-secondary))", marginBottom: "16px" }}>{f.email}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <BookOpen size={14} style={{ color: "hsl(var(--primary))" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "hsl(var(--primary))" }}>{f.course}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
});
