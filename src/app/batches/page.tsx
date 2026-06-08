"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit3, Trash2, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBatches, useCourses, useFaculties, useStudents } from "@/hooks/useDashboardData";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { CustomMultiSelect } from "@/components/ui/CustomMultiSelect";

const DAY_OPTIONS = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

export default function BatchesPage() {
  const [viewMode, setViewMode] = useState<"list" | "form" | "view">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [batchesPage, setBatchesPage] = useState(1);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState({ name: "", course: "", faculty: "", students: [] as string[], days: [] as string[], timing: "" });
  const [batchStartTime, setBatchStartTime] = useState("09:00");
  const [batchEndTime, setBatchEndTime] = useState("10:30");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [initialBatchStudents, setInitialBatchStudents] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess) setUser(data.user);
      });
  }, []);

  const { data: batches = [], refetch: refetchBatches } = useBatches();
  const { data: courses = [] } = useCourses();
  const { data: faculties = [] } = useFaculties();
  const { data: students = [] } = useStudents();
  const ITEMS_PER_PAGE = 8;

  const filteredBatches = useMemo(() => {
    return batches.filter(
      (b: any) =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [batches, searchTerm]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!batchForm.name) errors.name = "Batch name is required";
    if (!batchForm.course) errors.course = "Course selection is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const url = editingBatchId ? `/api/batch?id=${editingBatchId}` : "/api/batch";
      const method = editingBatchId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchForm),
      });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Success", editingBatchId ? "Batch updated successfully!" : "Batch created successfully!", "success");
        setViewMode("list");
        setBatchStartTime("09:00");
        setBatchEndTime("10:30");
        setBatchForm({ name: "", course: "", faculty: "", students: [], days: [], timing: "09:00 - 10:30" });
        setEditingBatchId(null);
        setFormErrors({});
        refetchBatches();
      } else {
        Swal.fire("Error", data.message || "Failed to save", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  const handleDeleteBatch = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Batch?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/batch?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Deleted", "Batch deleted successfully", "success");
        refetchBatches();
      }
    }
  };

  const handleOpenEditBatch = (batch: any) => {
    setEditingBatchId(batch._id);
    const timingParts = (batch.timing || "").split(" - ");
    const startVal = timingParts[0] || "09:00";
    const endVal = timingParts[1] || "10:30";
    setBatchStartTime(startVal);
    setBatchEndTime(endVal);
    setBatchForm({
      name: batch.name,
      course: batch.course,
      faculty: batch.faculty || "",
      students: batch.students || [],
      days: batch.days || [],
      timing: batch.timing || `${startVal} - ${endVal}`,
    });
    setInitialBatchStudents(batch.students || []);
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

      // Handle students count sorting
      if (sortField === "students") {
        const countA = a.students?.length || 0;
        const countB = b.students?.length || 0;
        return sortDirection === "asc" ? countA - countB : countB - countA;
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
  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);
  const paginatedBatches = useMemo(() => {
    const sorted = getSortedData(filteredBatches);
    const start = (batchesPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBatches, batchesPage, sortField, sortDirection]);

  return (
    <DashboardLayout activeTab="batches">
      {viewMode === "form" ? (
        <div className="animate-fade-in glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 800 }}>
                {editingBatchId ? "Edit Batch" : "Create New Batch"}
              </h2>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Configure batch specifications below.</p>
            </div>
          </div>
          <form onSubmit={handleCreateBatch} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Batch Name <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                <input type="text" placeholder="Batch Name (e.g. Python-Evening)" value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} className="input-field" style={{ border: formErrors.name ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
                {formErrors.name && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.name}</span>}
              </div>
              {user?.role === "admin" ? (
                <CustomDropdown label="Assigned Course" value={batchForm.course} options={courses.map((c: any) => ({ label: c.name, value: c.name }))} onChange={(val) => setBatchForm({ ...batchForm, course: val, faculty: "", students: [] })} required error={formErrors.course} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Course</label>
                  <input type="text" value={user?.course || ""} disabled className="input-field" style={{ backgroundColor: "hsl(var(--bg-primary))" }} />
                </div>
              )}
            </div>
            {batchForm.course && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                  <CustomDropdown label="Assign Faculty" value={batchForm.faculty} options={faculties.filter((f: any) => f.course?.toLowerCase() === batchForm.course?.toLowerCase()).map((f: any) => ({ label: `${f.name} (${f.email})`, value: f.email }))} onChange={(val) => setBatchForm({ ...batchForm, faculty: val })} placeholder="-- Select Faculty (Optional) --" error={formErrors.faculty} />
                  <CustomMultiSelect label="Assign Students" selected={batchForm.students} options={students.filter((s: any) => s.course?.toLowerCase() === batchForm.course?.toLowerCase()).map((s: any) => ({ label: `${s.name} (${s.email})`, value: s.userId }))} onChange={(vals) => {
                    if (user?.role === "faculty" && editingBatchId) {
                      const missingInitial = initialBatchStudents.filter(id => !vals.includes(id));
                      if (missingInitial.length > 0) {
                        const merged = Array.from(new Set([...vals, ...initialBatchStudents]));
                        setBatchForm({ ...batchForm, students: merged });
                        return;
                      }
                    }
                    setBatchForm({ ...batchForm, students: vals });
                  }} error={formErrors.students} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                  <CustomMultiSelect label="Batch Schedule Days" selected={batchForm.days} options={DAY_OPTIONS} onChange={(vals) => setBatchForm({ ...batchForm, days: vals })} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Batch Timings</label>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <input 
                        type="time" 
                        value={batchStartTime} 
                        onChange={(e) => {
                          const start = e.target.value;
                          setBatchStartTime(start);
                          setBatchForm({ ...batchForm, timing: `${start} - ${batchEndTime}` });
                        }} 
                        onClick={(e) => e.currentTarget.showPicker()}
                        className="input-field" 
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontSize: "13px", color: "hsl(var(--text-secondary))" }}>to</span>
                      <input 
                        type="time" 
                        value={batchEndTime} 
                        onChange={(e) => {
                          const end = e.target.value;
                          setBatchEndTime(end);
                          setBatchForm({ ...batchForm, timing: `${batchStartTime} - ${end}` });
                        }} 
                        onClick={(e) => e.currentTarget.showPicker()}
                        className="input-field" 
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" onClick={() => { setViewMode("list"); setEditingBatchId(null); setFormErrors({}); }} className="btn-secondary" style={{ minWidth: "120px", height: "46px" }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ minWidth: "140px", height: "46px" }}>{editingBatchId ? "Save Updates" : "Create Batch"}</button>
            </div>
          </form>
        </div>
      ) : viewMode === "view" ? null : (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Batch Configurations</h1>
              <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Configure portal student cohorts.</p>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ maxWidth: "320px", height: "40px" }}
              />
              {(user?.role === "admin" || user?.role === "faculty") && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingBatchId(null);
                    setBatchStartTime("09:00");
                    setBatchEndTime("10:30");
                    setBatchForm({ name: "", course: user?.course || "", faculty: user?.role === "faculty" ? user?.email : "", students: [], days: [], timing: "09:00 - 10:30" });
                    setInitialBatchStudents([]);
                    setViewMode("form");
                  }}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Plus size={16} /> Create Batch
                </button>
              )}
            </div>
 
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", fontWeight: 600 }}>
                    <th style={{ padding: "16px 24px", userSelect: "none" }}>No.</th>
                    <th onClick={() => handleSort("name")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Batch Name {renderSortIndicator("name")}</th>
                    <th onClick={() => handleSort("course")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Assigned Course {renderSortIndicator("course")}</th>
                    <th onClick={() => handleSort("faculty")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Assigned Faculty {renderSortIndicator("faculty")}</th>
                    <th style={{ padding: "16px 24px" }}>Schedule (Days)</th>
                    <th style={{ padding: "16px 24px" }}>Timing</th>
                    <th onClick={() => handleSort("students")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Students Count {renderSortIndicator("students")}</th>
                    {(user?.role === "admin" || user?.role === "faculty") && <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedBatches.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No batches registered.</td>
                    </tr>
                  ) : (
                    paginatedBatches.map((batch: any, idx: number) => (
                      <tr key={batch._id} onClick={() => { setSelectedDetailItem(batch); setViewMode("view"); }} style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }} className="dropdown-item-hover">
                        <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{(batchesPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                        <td style={{ padding: "16px 24px", fontWeight: 600 }}>{batch.name}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{batch.course}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{batch.faculty || "Not assigned"}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>
                          {batch.days && batch.days.length > 0 ? batch.days.join(", ") : "Not set"}
                        </td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{batch.timing || "Not set"}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{batch.students?.length || 0} students</td>
                        {(user?.role === "admin" || user?.role === "faculty") && (
                          <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleOpenEditBatch(batch)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}>
                                <Edit3 size={14} />
                                Edit
                              </button>
                              {user?.role === "admin" && (
                                <button onClick={() => handleDeleteBatch(batch._id)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}>
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "12px 24px", borderTop: "1px solid hsl(var(--border-color))" }}>
                <span style={{ fontSize: "13px", color: "hsl(var(--text-secondary))" }}>Showing page {batchesPage} of {totalPages}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setBatchesPage((prev) => Math.max(prev - 1, 1))} disabled={batchesPage === 1} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Prev</button>
                  <button onClick={() => setBatchesPage((prev) => Math.min(prev + 1, totalPages))} disabled={batchesPage === totalPages} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Full Page Detail View */}
      {viewMode === "view" && selectedDetailItem && (
        <div className="animate-fade-in glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", width: "100%", margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => { setViewMode("list"); setSelectedDetailItem(null); }}
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
              <h2 style={{ fontSize: "24px", fontWeight: 800 }}>Batch Configuration Details</h2>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Detailed specifications and assigned students of the batch.</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Batch Name</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.name}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Assigned Course</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.course}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Assigned Faculty</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.faculty || "Not assigned"}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Schedule (Days)</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>
                {selectedDetailItem.days && selectedDetailItem.days.length > 0 ? selectedDetailItem.days.join(", ") : "Not set"}
              </p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Timings</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.timing || "Not set"}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Total Students</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.students?.length || 0} students</p>
            </div>
          </div>

          {/* Assigned Students List */}
          <div style={{ borderTop: "1px solid hsl(var(--border-color))", paddingTop: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Assigned Students ({selectedDetailItem.students?.length || 0})</h3>
            {selectedDetailItem.students?.length === 0 ? (
              <p style={{ color: "hsl(var(--text-secondary))" }}>No students currently assigned to this batch.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {selectedDetailItem.students?.map((stuId: string, idx: number) => {
                  const studentInfo = students.find((s: any) => s.userId === stuId);
                  return (
                    <div key={stuId} style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: "14px", color: "hsl(var(--primary))" }}>No. {idx + 1}</span>
                        <span style={{ fontSize: "11px", color: "hsl(var(--text-secondary))", textTransform: "uppercase", fontWeight: 700 }}>{stuId}</span>
                      </div>
                      <p style={{ fontSize: "15px", fontWeight: 700, marginTop: "4px" }}>{studentInfo?.name || "Loading name..."}</p>
                      <p style={{ fontSize: "12px", color: "hsl(var(--text-secondary))" }}>{studentInfo?.email || "Loading email..."}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
