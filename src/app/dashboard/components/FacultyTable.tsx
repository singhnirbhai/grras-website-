"use client";

import React, { memo } from "react";
import { Edit3, Trash2, Loader2 } from "lucide-react";

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
  isDeleting?: string | null;
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
  isDeleting = null,
}: FacultyTableProps) => {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", fontWeight: 600 }}>
              <th style={{ padding: "16px 24px", userSelect: "none" }}>
                No.
              </th>
              <th onClick={() => handleSort("name")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>
                Instructor Name {renderSortIndicator("name")}
              </th>
              <th onClick={() => handleSort("email")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>
                Email Address {renderSortIndicator("email")}
              </th>
              <th onClick={() => handleSort("course")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>
                Assigned Course {renderSortIndicator("course")}
              </th>
              <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculties.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No instructors found.</td>
              </tr>
            ) : (
              getSortedData(faculties)
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((f, idx) => (
                  <tr key={f._id} onClick={() => onRowClick?.(f)} style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }} className="dropdown-item-hover">
                    <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{(page - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{f.email}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ padding: "4px 10px", backgroundColor: "hsl(var(--primary-light))", color: "hsl(var(--primary))", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>
                        {f.course}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => onEdit(f)} disabled={isDeleting !== null} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}>
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button onClick={() => onDelete(f._id)} disabled={isDeleting !== null} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}>
                          {isDeleting === f._id ? (
                            <Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination(page, faculties.length, setPage)}
    </div>
  );
});
