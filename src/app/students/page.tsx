"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit3, Trash2, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudents, useBatches, useCourses, useFaculties } from "@/hooks/useDashboardData";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export default function StudentsPage() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [studentsPage, setStudentsPage] = useState(1);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({ name: "", email: "", course: "", batch: "", password: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("");

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess) setUser(data.user);
      });
  }, []);

  const { data: students = [], refetch: refetchStudents } = useStudents();
  const { data: batches = [] } = useBatches();
  const { data: courses = [] } = useCourses();
  const { data: faculties = [] } = useFaculties();
  const ITEMS_PER_PAGE = 8;

  // Batches taught by the logged-in faculty or the selected faculty filter (for admin)
  const availableBatchesForFilter = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") {
      if (!selectedFacultyFilter) return [];
      return batches.filter((b: any) => b.faculty?.toLowerCase() === selectedFacultyFilter.toLowerCase());
    } else if (user.role === "faculty") {
      return batches.filter((b: any) => 
        b.faculty?.toLowerCase() === user.email?.toLowerCase() ||
        b.faculty?.toLowerCase() === user.name?.toLowerCase()
      );
    }
    return [];
  }, [user, batches, selectedFacultyFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      const matchesSearch =
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.batch?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (user?.role === "faculty") {
        if (!(s.createdBy?.toLowerCase() === user.email?.toLowerCase() || s.batch !== "")) {
          return false;
        }
      }

      if (selectedFacultyFilter) {
        const studentBatch = batches.find((b: any) => b.name === s.batch);
        if (!studentBatch || studentBatch.faculty?.toLowerCase() !== selectedFacultyFilter.toLowerCase()) {
          return false;
        }
      }

      if (selectedBatchFilter) {
        if (s.batch !== selectedBatchFilter) {
          return false;
        }
      }

      return true;
    });
  }, [students, searchTerm, user, selectedFacultyFilter, selectedBatchFilter, batches]);

  const handleFacultyFilterChange = (val: string) => {
    setSelectedFacultyFilter(val);
    setSelectedBatchFilter("");
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!studentForm.name) errors.name = "Name is required";
    if (!studentForm.email) errors.email = "Email is required";
    if (user?.role === "admin" && !studentForm.course) errors.course = "Course is required";
    if (!editingStudentId && !studentForm.password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = user?.role === "faculty" ? { ...studentForm, course: user.course } : studentForm;
      const url = editingStudentId ? `/api/student?id=${editingStudentId}` : "/api/student";
      const method = editingStudentId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Success", editingStudentId ? "Student updated successfully!" : `Student added! ID: ${data.studentId}`, "success");
        setViewMode("list");
        setStudentForm({ name: "", email: "", course: "", batch: "", password: "" });
        setEditingStudentId(null);
        setFormErrors({});
        refetchStudents();
      } else {
        Swal.fire("Error", data.message || "Failed to save", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Student?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/student?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Deleted", "Student deleted successfully", "success");
        refetchStudents();
      }
    }
  };

  const handleOpenEditStudent = (student: any) => {
    setEditingStudentId(student._id);
    setStudentForm({
      name: student.name,
      email: student.email,
      course: student.course || "",
      batch: student.batch || "",
      password: "",
    });
    setViewMode("form");
  };

  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);

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
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const sorted = getSortedData(filteredStudents);
    const start = (studentsPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, studentsPage, sortField, sortDirection]);

  return (
    <DashboardLayout activeTab="students">
      {viewMode === "form" ? (
        <div className="animate-fade-in glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", width: "100%", margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => { setViewMode("list"); setEditingStudentId(null); setFormErrors({}); }}
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
                {editingStudentId ? "Edit Student" : "Add Student"}
              </h2>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Configure student specifications below.</p>
            </div>
          </div>
          <form onSubmit={handleCreateStudent} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Name <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                <input type="text" placeholder="Full Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="input-field" style={{ border: formErrors.name ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
                {formErrors.name && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.name}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Email <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                <input type="email" placeholder="Email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="input-field" style={{ border: formErrors.email ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
                {formErrors.email && <span style={{ fontSize: "10px", color: "hsl(var(--danger))" }}>{formErrors.email}</span>}
              </div>
              {user?.role === "admin" ? (
                <CustomDropdown 
                  label="Select Course" 
                  value={studentForm.course} 
                  options={courses.map((c: any) => ({ label: c.name, value: c.name }))} 
                  onChange={(val) => setStudentForm({ ...studentForm, course: val, batch: "" })} 
                  required 
                  error={formErrors.course} 
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Course</label>
                  <input type="text" value={user?.course || ""} disabled className="input-field" style={{ backgroundColor: "hsl(var(--bg-primary))" }} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Password {!editingStudentId && <span style={{ color: "hsl(var(--danger))" }}>*</span>}</label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={editingStudentId ? "Leave blank to keep current" : "Password"} 
                    value={studentForm.password} 
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} 
                    className="input-field" 
                    style={{ paddingRight: "72px", border: formErrors.password ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPass = generateRandomPassword();
                      setStudentForm(prev => ({ ...prev, password: newPass }));
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
                onClick={() => { setViewMode("list"); setEditingStudentId(null); setFormErrors({}); }} 
                className="btn-secondary" 
                style={{ minWidth: "120px", height: "46px" }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ minWidth: "140px", height: "46px" }}>{editingStudentId ? "Save Updates" : "Register Student"}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Student Registry</h1>
              <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Configure portal student credentials.</p>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "visible", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "16px", flex: 1, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  style={{ maxWidth: "320px", height: "40px" }}
                />
                {user?.role === "admin" && (
                  <div style={{ minWidth: "220px", marginTop: "-4px" }}>
                    <CustomDropdown
                      label=""
                      value={selectedFacultyFilter}
                      options={[
                        { label: "All Instructors", value: "" },
                        ...faculties.map((f: any) => ({ label: `${f.name} (${f.email})`, value: f.email }))
                      ]}
                      onChange={handleFacultyFilterChange}
                      placeholder="-- Filter by Instructor --"
                    />
                  </div>
                )}
                {((user?.role === "admin" && selectedFacultyFilter) || user?.role === "faculty") && (
                  <div style={{ minWidth: "200px", marginTop: "-4px" }}>
                    <CustomDropdown
                      label=""
                      value={selectedBatchFilter}
                      options={[
                        { label: "All Batches", value: "" },
                        ...availableBatchesForFilter.map((b: any) => ({ label: b.name, value: b.name }))
                      ]}
                      onChange={(val) => setSelectedBatchFilter(val)}
                      placeholder="-- Filter by Batch --"
                    />
                  </div>
                )}
              </div>
              {(user?.role === "admin" || user?.role === "faculty") && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingStudentId(null);
                    setStudentForm({ name: "", email: "", course: "", batch: "", password: "" });
                    setViewMode("form");
                  }}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Plus size={16} /> Register Student
                </button>
              )}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", fontWeight: 600 }}>
                    <th style={{ padding: "16px 24px", userSelect: "none" }}>No.</th>
                    <th onClick={() => handleSort("name")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Name {renderSortIndicator("name")}</th>
                    <th onClick={() => handleSort("email")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Email {renderSortIndicator("email")}</th>
                    <th onClick={() => handleSort("batch")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Batch {renderSortIndicator("batch")}</th>
                    <th onClick={() => handleSort("course")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Course {renderSortIndicator("course")}</th>
                    <th onClick={() => handleSort("assignedAt")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Assigned Date & Time {renderSortIndicator("assignedAt")}</th>
                    {user?.role === "admin" && <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={user?.role === "admin" ? 7 : 6} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No students registered.</td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student: any, idx: number) => (
                      <tr key={student._id} onClick={() => setSelectedDetailItem(student)} style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }} className="dropdown-item-hover">
                        <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{(studentsPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                        <td style={{ padding: "16px 24px", fontWeight: 600 }}>{student.name}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{student.email}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{student.batch || "Not assigned"}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{student.course}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>
                          {student.assignedAt ? new Date(student.assignedAt).toLocaleString() : "Not assigned"}
                        </td>
                        {user?.role === "admin" && (
                          <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleOpenEditStudent(student)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}>
                                <Edit3 size={14} />
                                Edit
                              </button>
                              <button onClick={() => handleDeleteStudent(student._id)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}>
                                <Trash2 size={14} />
                                Delete
                              </button>
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
                <span style={{ fontSize: "13px", color: "hsl(var(--text-secondary))" }}>Showing page {studentsPage} of {totalPages}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setStudentsPage((prev) => Math.max(prev - 1, 1))} disabled={studentsPage === 1} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Prev</button>
                  <button onClick={() => setStudentsPage((prev) => Math.min(prev + 1, totalPages))} disabled={studentsPage === totalPages} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Next</button>
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
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>Student Registry Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>User ID</span>
                <span style={{ fontWeight: 700, color: "hsl(var(--primary))" }}>{selectedDetailItem.userId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Name</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Email</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Course</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.course}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Batch</span>
                <span style={{ fontWeight: 600 }}>{selectedDetailItem.batch || "Not assigned"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Created By</span>
                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{selectedDetailItem.createdBy || "Admin"}</span>
              </div>
              {selectedDetailItem.batch && (
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                  <span style={{ color: "hsl(var(--text-secondary))" }}>Assigned Date & Time</span>
                  <span style={{ fontWeight: 600 }}>
                    {selectedDetailItem.assignedAt 
                      ? new Date(selectedDetailItem.assignedAt).toLocaleString() 
                      : new Date(selectedDetailItem.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Registration Date</span>
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
