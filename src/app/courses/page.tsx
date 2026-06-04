"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCourses } from "@/hooks/useDashboardData";

export default function CoursesPage() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [coursesPage, setCoursesPage] = useState(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);

  const { data: courses = [], refetch: refetchCourses } = useCourses();
  const ITEMS_PER_PAGE = 8;

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!courseForm.name) errors.name = "Course name is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const url = editingCourseId ? `/api/course?id=${editingCourseId}` : "/api/course";
      const method = editingCourseId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Success", editingCourseId ? "Course updated successfully!" : "Course created successfully!", "success");
        setViewMode("list");
        setCourseForm({ name: "", description: "" });
        setEditingCourseId(null);
        setFormErrors({});
        refetchCourses();
      } else {
        Swal.fire("Error", data.message || "Failed to save", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Course?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/course?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Deleted", "Course deleted successfully", "success");
        refetchCourses();
      }
    }
  };

  const handleOpenEditCourse = (course: any) => {
    setEditingCourseId(course._id);
    setCourseForm({
      name: course.name,
      description: course.description || "",
    });
    setViewMode("form");
  };

  // Sorting states
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sorting Helpers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedData = (data: any[]) => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let valA = a;
      let valB = b;
      const parts = sortField.split(".");
      for (const part of parts) {
        valA = valA ? valA[part] : "";
        valB = valB ? valB[part] : "";
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: "4px" }}>↕</span>;
    return sortDirection === "asc" ? <span style={{ marginLeft: "4px" }}>▲</span> : <span style={{ marginLeft: "4px" }}>▼</span>;
  };

  // Pagination helper
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const sorted = getSortedData(filteredCourses);
    const start = (coursesPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, coursesPage, sortField, sortDirection]);

  return (
    <DashboardLayout activeTab="courses">
      {viewMode === "form" ? (
        <div className="animate-fade-in glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 800 }}>
                {editingCourseId ? "Edit Course" : "Create New Course"}
              </h2>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Configure course specifications below.</p>
            </div>
          </div>
          <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Course Name <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
              <input type="text" placeholder="Course Name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="input-field" style={{ border: formErrors.name ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
              {formErrors.name && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.name}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Description</label>
              <textarea placeholder="Describe course..." value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="input-field" style={{ height: "120px", resize: "none" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" onClick={() => { setViewMode("list"); setEditingCourseId(null); setFormErrors({}); }} className="btn-secondary" style={{ minWidth: "120px", height: "46px" }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ minWidth: "140px", height: "46px" }}>{editingCourseId ? "Save Updates" : "Create Course"}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Course Specifications</h1>
              <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Configure portal curriculums.</p>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ maxWidth: "320px", height: "40px" }}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  setEditingCourseId(null);
                  setCourseForm({ name: "", description: "" });
                  setViewMode("form");
                }}
                style={{ whiteSpace: "nowrap" }}
              >
                <Plus size={16} /> Create Course
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", fontWeight: 600 }}>
                    <th style={{ padding: "16px 24px", userSelect: "none" }}>No.</th>
                    <th onClick={() => handleSort("name")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Course Name {renderSortIndicator("name")}</th>
                    <th onClick={() => handleSort("description")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Description {renderSortIndicator("description")}</th>
                    <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No courses assigned.</td>
                    </tr>
                  ) : (
                    paginatedCourses.map((course: any, idx: number) => (
                      <tr key={course._id} onClick={() => setSelectedDetailItem(course)} style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }} className="dropdown-item-hover">
                        <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{(coursesPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                        <td style={{ padding: "16px 24px", fontWeight: 600 }}>{course.name}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.description || "No description provided."}</td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button onClick={() => handleOpenEditCourse(course)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}>
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button onClick={() => handleDeleteCourse(course._id)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}>
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
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "12px 24px", borderTop: "1px solid hsl(var(--border-color))" }}>
                <span style={{ fontSize: "13px", color: "hsl(var(--text-secondary))" }}>Showing page {coursesPage} of {totalPages}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setCoursesPage((prev) => Math.max(prev - 1, 1))} disabled={coursesPage === 1} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Prev</button>
                  <button onClick={() => setCoursesPage((prev) => Math.min(prev + 1, totalPages))} disabled={coursesPage === totalPages} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {selectedDetailItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass" style={{ width: "100%", maxWidth: "500px", padding: "32px", borderRadius: "var(--radius-lg)", backgroundColor: "hsl(var(--bg-secondary))" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>Course Specifications Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Course Name</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.name}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Description</span>
                <p style={{ fontSize: "14px", color: "hsl(var(--text-primary))", lineHeight: 1.5 }}>{selectedDetailItem.description || "No description provided."}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Created Date</span>
                <span style={{ fontWeight: 600 }}>{new Date(selectedDetailItem.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedDetailItem(null)} className="btn-primary" style={{ minWidth: "120px" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
