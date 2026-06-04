"use client";

import React, { useState, useMemo } from "react";
import { Plus, Table, Kanban, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useFaculties, useCourses } from "@/hooks/useDashboardData";
import { FacultyTable } from "@/app/dashboard/components/FacultyTable";
import { FacultyKanban } from "@/app/dashboard/components/FacultyKanban";
import { FacultyForm } from "@/app/dashboard/components/FacultyForm";

export default function FacultiesPage() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyViewMode, setFacultyViewMode] = useState<"table" | "kanban">("table");
  const [facultiesPage, setFacultiesPage] = useState(1);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [facultyForm, setFacultyForm] = useState({ name: "", email: "", course: "", password: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);

  // Sorting states
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const ITEMS_PER_PAGE = 8;

  const { data: faculties = [], refetch: refetchFaculties } = useFaculties();
  const { data: courses = [] } = useCourses();

  const filteredFaculties = useMemo(() => {
    return faculties.filter(
      (f: any) =>
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faculties, searchTerm]);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!facultyForm.name) errors.name = "Name is required";
    if (!facultyForm.email) errors.email = "Email is required";
    if (!facultyForm.course) errors.course = "Course assignment is required";
    if (!editingFacultyId && !facultyForm.password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const url = editingFacultyId ? `/api/faculty?id=${editingFacultyId}` : "/api/faculty";
      const method = editingFacultyId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facultyForm),
      });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Success", editingFacultyId ? "Faculty updated successfully!" : "Faculty created successfully!", "success");
        setViewMode("list");
        setFacultyForm({ name: "", email: "", course: "", password: "" });
        setEditingFacultyId(null);
        setFormErrors({});
        refetchFaculties();
      } else {
        Swal.fire("Error", data.message || "Failed to save", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Faculty?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Deleted", "Faculty deleted successfully", "success");
        refetchFaculties();
      }
    }
  };

  const handleOpenEditFaculty = (faculty: any) => {
    setEditingFacultyId(faculty._id);
    setFacultyForm({
      name: faculty.name,
      email: faculty.email,
      course: faculty.course || "",
      password: "",
    });
    setViewMode("form");
  };

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

  const renderPagination = (currentPage: number, totalItems: number, onPageChange: (page: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "12px 24px", borderTop: "1px solid hsl(var(--border-color))" }}>
        <span style={{ fontSize: "13px", color: "hsl(var(--text-secondary))" }}>
          Showing page {currentPage} of {totalPages} ({totalItems} total items)
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary"
            style={{ padding: "6px 12px", height: "auto", fontSize: "12px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            Prev
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary"
            style={{ padding: "6px 12px", height: "auto", fontSize: "12px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout activeTab="faculties">
      {viewMode === "form" ? (
        <div className="animate-fade-in glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", width: "100%", margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => { setViewMode("list"); setFormErrors({}); setEditingFacultyId(null); }}
            className="btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minWidth: "120px",
              height: "46px",
              marginBottom: "24px",
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 800 }}>
                {editingFacultyId ? "Edit Faculty Instructor" : "Add Faculty Instructor"}
              </h2>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Manage and update details below.</p>
            </div>
          </div>
          <FacultyForm
            facultyForm={facultyForm}
            setFacultyForm={setFacultyForm}
            formErrors={formErrors}
            editingFacultyId={editingFacultyId}
            courses={courses}
            onSubmit={handleCreateFaculty}
            onCancel={() => {
              setViewMode("list");
              setFormErrors({});
              setEditingFacultyId(null);
            }}
          />
        </div>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Faculty Management</h1>
              <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Configure and manage portal instructors.</p>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ maxWidth: "320px", height: "40px" }}
              />
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ display: "flex", backgroundColor: "hsl(var(--bg-secondary))", border: "1px solid hsl(var(--border-color))", borderRadius: "var(--radius-md)", padding: "4px" }}>
                  <button
                    onClick={() => setFacultyViewMode("table")}
                    className={`btn-secondary ${facultyViewMode === "table" ? "active" : ""}`}
                    style={{
                      padding: "8px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: facultyViewMode === "table" ? "hsl(var(--primary-light))" : "transparent",
                      color: facultyViewMode === "table" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Table size={18} />
                  </button>
                  <button
                    onClick={() => setFacultyViewMode("kanban")}
                    className={`btn-secondary ${facultyViewMode === "kanban" ? "active" : ""}`}
                    style={{
                      padding: "8px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: facultyViewMode === "kanban" ? "hsl(var(--primary-light))" : "transparent",
                      color: facultyViewMode === "kanban" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Kanban size={18} />
                  </button>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingFacultyId(null);
                    setFacultyForm({ name: "", email: "", course: "", password: "" });
                    setViewMode("form");
                  }}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Plus size={16} /> Add Instructor
                </button>
              </div>
            </div>

            {facultyViewMode === "table" ? (
              <FacultyTable
                faculties={filteredFaculties}
                onEdit={handleOpenEditFaculty}
                onDelete={handleDeleteFaculty}
                onRowClick={setSelectedDetailItem}
                handleSort={handleSort}
                renderSortIndicator={renderSortIndicator}
                getSortedData={getSortedData}
                page={facultiesPage}
                setPage={setFacultiesPage}
                itemsPerPage={ITEMS_PER_PAGE}
                renderPagination={renderPagination}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
                <FacultyKanban
                  faculties={getSortedData(filteredFaculties).slice((facultiesPage - 1) * ITEMS_PER_PAGE, facultiesPage * ITEMS_PER_PAGE)}
                  onEdit={handleOpenEditFaculty}
                  onDelete={handleDeleteFaculty}
                />
                {renderPagination(facultiesPage, filteredFaculties.length, setFacultiesPage)}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {selectedDetailItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass" style={{ width: "100%", maxWidth: "500px", padding: "32px", borderRadius: "var(--radius-lg)", backgroundColor: "hsl(var(--bg-secondary))" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>Faculty Instructor Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Instructor Name</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Email Address</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Assigned Course</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.course || "None"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Registered Date</span>
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
