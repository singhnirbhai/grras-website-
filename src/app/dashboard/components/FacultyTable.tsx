"use client";

import React, { memo } from "react";
import { Edit3, Trash2 } from "lucide-react";

interface FacultyTableProps {
  faculties: any[];
  onEdit: (faculty: any) => void;
  onDelete: (id: string) => void;
  onRowClick?: (faculty: any) => void;
  handleSort: (key: string) => void;
  renderSortIndicator: (key: string) => React.ReactNode;
  getSortedData: (data: any[]) => any[];
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
  renderPagination: (currentPage: number, totalItems: number, setPage: (p: number) => void) => React.ReactNode;
}

export const FacultyTable = memo(({
  faculties,
  onEdit,
  onDelete,
  onRowClick,
  handleSort,
  renderSortIndicator,
  getSortedData,
  page,
  setPage,
  itemsPerPage,
  renderPagination,
}: FacultyTableProps) => {
  return (
    <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", backgroundColor: "hsl(var(--primary-light))" }}>
            <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 700, userSelect: "none" }}>
              No.
            </th>
            <th onClick={() => handleSort("name")} style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}>
              Instructor Name {renderSortIndicator("name")}
            </th>
            <th onClick={() => handleSort("email")} style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}>
              Email Address {renderSortIndicator("email")}
            </th>
            <th onClick={() => handleSort("course")} style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}>
              Assigned Course {renderSortIndicator("course")}
            </th>
            <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {faculties.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No instructors found</td>
            </tr>
          ) : (
            getSortedData(faculties)
              .slice((page - 1) * itemsPerPage, page * itemsPerPage)
              .map((f, idx) => (
                <tr key={f._id} onClick={() => onRowClick?.(f)} style={{ borderBottom: "1px solid hsl(var(--border-color))", cursor: "pointer" }} className="dropdown-item-hover">
                  <td style={{ padding: "16px", fontWeight: 700, color: "hsl(var(--primary))" }}>{(page - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "16px", fontWeight: 600 }}>{f.name}</td>
                  <td style={{ padding: "16px", color: "hsl(var(--text-secondary))" }}>{f.email}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "4px 10px", backgroundColor: "hsl(var(--primary-light))", color: "hsl(var(--primary))", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>
                      {f.course}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => onEdit(f)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}>
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button onClick={() => onDelete(f._id)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}>
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
      {renderPagination(page, faculties.length, setPage)}
    </div>
  );
});
