"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit3, Trash2, Calendar, Clock, Trophy, Download, Timer, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import moment from "moment-timezone";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuizzes, useBatches } from "@/hooks/useDashboardData";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { CustomFileUpload } from "@/components/ui/CustomFileUpload";

export default function QuizzesPage() {
  const [viewMode, setViewMode] = useState<"list" | "form" | "view">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoadingManual, setIsLoadingManual] = useState(false);

  // Upload states
  const [uploadForm, setUploadForm] = useState({
    course: "",
    batch: "",
    fileName: "",
    startTime: "",
    endTime: "",
    duration: 30,
  });
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  // Reschedule states
  const [selectedFileForSchedule, setSelectedFileForSchedule] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({
    startTime: "",
    endTime: "",
    duration: 30,
  });

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess) setUser(data.user);
      });
  }, []);

  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [detailQuestions, setDetailQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    if (selectedDetailItem) {
      setIsLoadingQuestions(true);
      fetch(`/api/quiz?fileName=${encodeURIComponent(selectedDetailItem.fileName)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.isSuccess) {
            setDetailQuestions(data.data || []);
          } else {
            setDetailQuestions([]);
          }
        })
        .catch(() => setDetailQuestions([]))
        .finally(() => setIsLoadingQuestions(false));
    } else {
      setDetailQuestions([]);
    }
  }, [selectedDetailItem]);

  // Auto-calculate upload form duration
  useEffect(() => {
    if (uploadForm.startTime && uploadForm.endTime) {
      const start = new Date(uploadForm.startTime);
      const end = new Date(uploadForm.endTime);
      const diffMs = end.getTime() - start.getTime();
      if (!isNaN(diffMs) && diffMs > 0) {
        const diffMins = Math.round(diffMs / 60000);
        setUploadForm((prev) => ({ ...prev, duration: diffMins }));
      }
    }
  }, [uploadForm.startTime, uploadForm.endTime]);

  // Auto-calculate schedule form duration
  useEffect(() => {
    if (scheduleForm.startTime && scheduleForm.endTime) {
      const start = new Date(scheduleForm.startTime);
      const end = new Date(scheduleForm.endTime);
      const diffMs = end.getTime() - start.getTime();
      if (!isNaN(diffMs) && diffMs > 0) {
        const diffMins = Math.round(diffMs / 60000);
        setScheduleForm((prev) => ({ ...prev, duration: diffMins }));
      }
    }
  }, [scheduleForm.startTime, scheduleForm.endTime]);

  const { data: quizFiles = [], refetch: refetchQuizzes } = useQuizzes();
  const { data: batches = [] } = useBatches();
  const ITEMS_PER_PAGE = 8;

  const filteredQuizFiles = useMemo(() => {
    return quizFiles.filter(
      (q: any) =>
        q.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.Course?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quizFiles, searchTerm]);

  // Reschedule quiz
  const handleOpenScheduleModal = (file: any) => {
    setSelectedFileForSchedule(file);
    setScheduleForm({
      startTime: moment(file.startTime).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(file.endTime).format("YYYY-MM-DDTHH:mm"),
      duration: file.duration || 30,
    });
    setViewMode("form");
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!scheduleForm.startTime) errors.startTime = "Start time is required";
    if (!scheduleForm.endTime) errors.endTime = "End time is required";
    if (scheduleForm.startTime && scheduleForm.endTime && (!scheduleForm.duration || scheduleForm.duration <= 0)) {
      errors.endTime = "End time must be after start time";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const res = await fetch("/api/quiz/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFileForSchedule.fileName,
          course: selectedFileForSchedule.Course,
          ...scheduleForm,
        }),
      });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Rescheduled", "Quiz schedule updated successfully!", "success");
        setViewMode("list");
        setSelectedFileForSchedule(null);
        setFormErrors({});
        refetchQuizzes();
      } else {
        Swal.fire("Error", data.message || "Rescheduling failed", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Rescheduling failed", "error");
    }
  };

  const handleDeleteQuizFile = async (fileName: string) => {
    const confirm = await Swal.fire({
      title: "Delete Quiz?",
      text: `Are you sure you want to delete all questions for "${fileName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/quiz?fileName=${encodeURIComponent(fileName)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Deleted", "Quiz file deleted successfully", "success");
        refetchQuizzes();
      }
    }
  };

  // Upload handler
  const processUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!uploadForm.batch) errors.batch = "Please select a Batch";
    if (!uploadForm.fileName) errors.fileName = "File Name Tag is required";
    if (!uploadForm.startTime) errors.startTime = "Start time is required";
    if (!uploadForm.endTime) errors.endTime = "End time is required";
    if (uploadForm.startTime && uploadForm.endTime && (!uploadForm.duration || uploadForm.duration <= 0)) {
      errors.endTime = "End time must be after start time";
    }
    if (!selectedUploadFile) errors.file = "Please select a file to upload";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoadingManual(true);
    const ext = selectedUploadFile!.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        let parsedQuizzes: any[] = [];

        if (ext === "json") {
          const content = evt.target?.result as string;
          const parsed = JSON.parse(content);
          parsedQuizzes = Array.isArray(parsed) ? parsed : (parsed.quizzes || parsed.data || []);
        } else {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet) as any[];

          parsedQuizzes = rows.map((row) => {
            const question = row.Question || row.question || "";
            const options = row.Options || [row.A || row.option1, row.B || row.option2, row.C || row.option3, row.D || row.option4];
            const correct = row.CorrectAnswer || row.correctAnswer || row.Answer || "";
            return {
              Question: question,
              Options: options.map((o: any) => o?.toString().trim()).filter(Boolean),
              CorrectAnswer: correct?.toString().trim(),
            };
          });
        }

        const validQuizzes = parsedQuizzes.filter((q) => {
          return q.Question && q.Options?.length === 4 && q.CorrectAnswer && q.Options.includes(q.CorrectAnswer);
        });

        if (validQuizzes.length === 0) {
          Swal.fire("Error", "No valid quizzes found in file. Make sure questions have 4 options and a correct answer listed.", "error");
          setIsLoadingManual(false);
          return;
        }

        const payload = {
          ...uploadForm,
          course: user?.role === "faculty" ? user.course : uploadForm.course,
          quizzes: validQuizzes,
        };

        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await res.json();
        if (resData.isSuccess) {
          Swal.fire("Uploaded", `${validQuizzes.length} questions uploaded successfully!`, "success");
          setViewMode("list");
          setUploadForm({ course: "", batch: "", fileName: "", startTime: "", endTime: "", duration: 30 });
          setFormErrors({});
          setSelectedUploadFile(null);
          refetchQuizzes();
        } else {
          Swal.fire("Error", resData.message || "Failed to upload quizzes", "error");
        }
      } catch (err: any) {
        Swal.fire("Error", "Failed to parse file: " + err.message, "error");
      } finally {
        setIsLoadingManual(false);
      }
    };

    if (ext === "json") {
      reader.readAsText(selectedUploadFile as Blob);
    } else {
      reader.readAsArrayBuffer(selectedUploadFile as Blob);
    }
  };

  const downloadTemplate = (format: "xlsx" | "csv" | "json") => {
    const templateData = [
      {
        Question: "What is the primary language used in Next.js?",
        A: "Python",
        B: "TypeScript",
        C: "Java",
        D: "C++",
        CorrectAnswer: "TypeScript",
      },
      {
        Question: "Which component is used for routing in Next.js?",
        A: "React Router",
        B: "App Router",
        C: "Express Router",
        D: "Vue Router",
        CorrectAnswer: "App Router",
      },
    ];

    if (format === "json") {
      const fileData = [
        {
          Question: "What is the primary language used in Next.js?",
          Options: ["Python", "TypeScript", "Java", "C++"],
          CorrectAnswer: "TypeScript",
        },
      ];
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fileData, null, 2));
      const a = document.createElement("a");
      a.href = dataStr;
      a.download = "quiz_template.json";
      a.click();
    } else {
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz");
      if (format === "xlsx") {
        XLSX.writeFile(workbook, "quiz_template.xlsx");
      } else {
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        const a = document.createElement("a");
        a.href = dataStr;
        a.download = "quiz_template.csv";
        a.click();
      }
    }
  };

  const formatIST = (utcDate: string) => {
    return moment(utcDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm");
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
      
      // Handle mapping to schema casing
      const fieldName = sortField === "fileName" ? "fileName" : 
                        sortField === "course" ? "Course" : 
                        sortField === "batch" ? "Batch" : sortField;
      
      const parts = fieldName.split(".");
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
  const totalPages = Math.ceil(filteredQuizFiles.length / ITEMS_PER_PAGE);
  const paginatedQuizzes = useMemo(() => {
    const sorted = getSortedData(filteredQuizFiles);
    const start = (quizzesPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuizFiles, quizzesPage, sortField, sortDirection]);

  return (
    <DashboardLayout activeTab="quizzes">
      {viewMode === "form" ? (
        <div className="animate-fade-in glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 800 }}>
                {selectedFileForSchedule ? "Reschedule Quiz" : "Upload Quiz Exam"}
              </h2>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Configure quiz parameters below.</p>
            </div>
          </div>

          {selectedFileForSchedule ? (
            <form onSubmit={handleUpdateSchedule} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Start Time <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                  <input type="datetime-local" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} onClick={(e) => e.currentTarget.showPicker()} className="input-field" style={{ border: formErrors.startTime ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
                  {formErrors.startTime && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "2px" }}>{formErrors.startTime}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>End Time <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                  <input type="datetime-local" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} onClick={(e) => e.currentTarget.showPicker()} className="input-field" style={{ border: formErrors.endTime ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
                  {formErrors.endTime && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "2px" }}>{formErrors.endTime}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Duration (Minutes) <small style={{ fontWeight: 500, color: "hsl(var(--text-muted))" }}>(Auto-calculated)</small></label>
                  <input type="number" value={scheduleForm.duration} className="input-field" style={{ backgroundColor: "hsl(var(--bg-primary))", cursor: "not-allowed" }} disabled />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => { setViewMode("list"); setSelectedFileForSchedule(null); setFormErrors({}); }} className="btn-secondary" style={{ minWidth: "120px", height: "46px" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ minWidth: "140px", height: "46px" }}>Update Schedule</button>
              </div>
            </form>
          ) : (
            <form onSubmit={processUpload} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
                <CustomDropdown label="Target Batch" value={uploadForm.batch} options={batches.filter((b: any) => user?.role === "admin" || b.course?.toLowerCase().trim() === user?.course?.toLowerCase().trim()).map((b: any) => ({ label: `${b.name} (${b.course})`, value: b.name }))} onChange={(val) => { const b = batches.find((b: any) => b.name === val); setUploadForm({ ...uploadForm, batch: b?.name || "", course: b?.course || "" }); }} required error={formErrors.batch} />
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>File Label <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                  <input type="text" value={uploadForm.fileName} onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })} className="input-field" style={{ border: formErrors.fileName ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} placeholder="e.g. Midterm exam" />
                  {formErrors.fileName && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "2px" }}>{formErrors.fileName}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Start Time <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                  <input type="datetime-local" value={uploadForm.startTime} onChange={(e) => setUploadForm({ ...uploadForm, startTime: e.target.value })} onClick={(e) => e.currentTarget.showPicker()} className="input-field" style={{ border: formErrors.startTime ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
                  {formErrors.startTime && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "2px" }}>{formErrors.startTime}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>End Time <span style={{ color: "hsl(var(--danger))" }}>*</span></label>
                  <input type="datetime-local" value={uploadForm.endTime} onChange={(e) => setUploadForm({ ...uploadForm, endTime: e.target.value })} onClick={(e) => e.currentTarget.showPicker()} className="input-field" style={{ border: formErrors.endTime ? "1px solid hsl(var(--danger))" : "1px solid hsl(var(--border-color))" }} />
                  {formErrors.endTime && <span style={{ fontSize: "10px", color: "hsl(var(--danger))", marginTop: "2px" }}>{formErrors.endTime}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>Duration (Minutes) <small style={{ fontWeight: 500, color: "hsl(var(--text-muted))" }}>(Auto-calculated)</small></label>
                  <input type="number" value={uploadForm.duration} className="input-field" style={{ backgroundColor: "hsl(var(--bg-primary))", cursor: "not-allowed" }} disabled />
                </div>
                <CustomFileUpload label="Select Questions File" fileName={selectedUploadFile?.name || ""} onChange={(file) => setSelectedUploadFile(file)} required error={formErrors.file} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => { setViewMode("list"); setFormErrors({}); }} className="btn-secondary" style={{ minWidth: "120px", height: "46px" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ minWidth: "140px", height: "46px" }}>Upload Exam</button>
              </div>
            </form>
          )}
        </div>
      ) : viewMode === "view" ? null : (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Quiz Assessments</h1>
              <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Upload and schedule course exams.</p>
            </div>
            {(user?.role === "admin" || user?.role === "faculty") && (
              <div style={{ display: "flex", gap: "12px" }}>
                <div className="dropdown-container-relative" style={{ display: "inline-block" }}>
                  <button className="btn-secondary" style={{ display: "flex", gap: "8px", alignItems: "center" }} onClick={() => {
                    const el = document.getElementById("template-dropdown");
                    if (el) el.style.display = el.style.display === "block" ? "none" : "block";
                  }}>
                    <Download size={16} /> Templates
                  </button>
                  <div id="template-dropdown" className="glass" style={{ display: "none", position: "absolute", right: 0, marginTop: "8px", zIndex: 100, borderRadius: "var(--radius-md)", overflow: "hidden", minWidth: "160px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", backgroundColor: "hsl(var(--bg-secondary))", border: "1px solid hsl(var(--border-color))" }}>
                    <button onClick={() => { downloadTemplate("xlsx"); document.getElementById("template-dropdown")!.style.display = "none"; }} style={{ width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px" }} className="dropdown-item-hover">Excel (.xlsx)</button>
                    <button onClick={() => { downloadTemplate("csv"); document.getElementById("template-dropdown")!.style.display = "none"; }} style={{ width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px" }} className="dropdown-item-hover">CSV (.csv)</button>
                    <button onClick={() => { downloadTemplate("json"); document.getElementById("template-dropdown")!.style.display = "none"; }} style={{ width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px" }} className="dropdown-item-hover">JSON (.json)</button>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setUploadForm({ course: "", batch: "", fileName: "", startTime: "", endTime: "", duration: 30 });
                    setSelectedUploadFile(null);
                    setFormErrors({});
                    setViewMode("form");
                  }}
                >
                  <Plus size={16} /> Upload Quiz
                </button>
              </div>
            )}
          </div>

          <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search quiz files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ maxWidth: "320px", height: "40px" }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", fontWeight: 600 }}>
                    <th style={{ padding: "16px 24px", userSelect: "none" }}>No.</th>
                    <th onClick={() => handleSort("fileName")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Quiz Label {renderSortIndicator("fileName")}</th>
                    <th onClick={() => handleSort("course")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Course {renderSortIndicator("course")}</th>
                    <th onClick={() => handleSort("batch")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Batch {renderSortIndicator("batch")}</th>
                    <th onClick={() => handleSort("startTime")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Start / End Time (IST) {renderSortIndicator("startTime")}</th>
                    <th onClick={() => handleSort("duration")} style={{ padding: "16px 24px", cursor: "pointer", userSelect: "none" }}>Duration {renderSortIndicator("duration")}</th>
                    {(user?.role === "admin" || user?.role === "faculty") && <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuizzes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No quiz schedules.</td>
                    </tr>
                  ) : (
                    paginatedQuizzes.map((file: any, idx: number) => (
                      <tr key={idx} onClick={() => { setSelectedDetailItem(file); setViewMode("view"); }} style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }} className="dropdown-item-hover">
                        <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{(quizzesPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                        <td style={{ padding: "16px 24px", fontWeight: 600 }}>{file.fileName}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{file.Course}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{file.batch}</td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                              <Calendar size={12} style={{ color: "hsl(var(--primary))" }} /> {formatIST(file.startTime)}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                              <Clock size={12} style={{ color: "hsl(var(--danger))" }} /> {formatIST(file.endTime)}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Timer size={14} /> {file.duration} mins
                          </div>
                        </td>
                        {(user?.role === "admin" || user?.role === "faculty") && (
                          <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleOpenScheduleModal(file)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}>
                                <Calendar size={14} />
                                Reschedule
                              </button>
                              <button onClick={() => handleDeleteQuizFile(file.fileName)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}>
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
                <span style={{ fontSize: "13px", color: "hsl(var(--text-secondary))" }}>Showing page {quizzesPage} of {totalPages}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setQuizzesPage((prev) => Math.max(prev - 1, 1))} disabled={quizzesPage === 1} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Prev</button>
                  <button onClick={() => setQuizzesPage((prev) => Math.min(prev + 1, totalPages))} disabled={quizzesPage === totalPages} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Next</button>
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
              <h2 style={{ fontSize: "24px", fontWeight: 800 }}>Quiz Assessment Details</h2>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Review scheduled quiz specifications and questions.</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Quiz Label</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.fileName}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Assigned Course</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.Course}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Target Batch</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.batch}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Start Time (IST)</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{formatIST(selectedDetailItem.startTime)}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>End Time (IST)</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{formatIST(selectedDetailItem.endTime)}</p>
            </div>
            <div style={{ padding: "16px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Duration</span>
              <p style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>{selectedDetailItem.duration} minutes</p>
            </div>
          </div>

          {/* If admin or faculty, show the scheduled questions */}
          {(user?.role === "admin" || user?.role === "faculty") && (
            <div style={{ marginTop: "20px", borderTop: "1px solid hsl(var(--border-color))", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Scheduled Questions ({detailQuestions.length})</h3>
              {isLoadingQuestions ? (
                <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>Loading questions...</p>
              ) : detailQuestions.length === 0 ? (
                <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>No questions found in this quiz.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {detailQuestions.map((q, qIdx) => (
                    <div key={q._id || qIdx} style={{ padding: "24px", backgroundColor: "hsl(var(--bg-primary))", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))" }}>
                      <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>Q{qIdx + 1}: {q.Question}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                        {q.Options?.map((opt: string, oIdx: number) => (
                          <div key={oIdx} style={{
                            padding: "10px 14px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: opt === q.CorrectAnswer ? "hsl(var(--success-light))" : "hsl(var(--bg-secondary))",
                            color: opt === q.CorrectAnswer ? "hsl(var(--success))" : "hsl(var(--text-primary))",
                            border: `1px solid ${opt === q.CorrectAnswer ? "rgba(var(--success), 0.2)" : "hsl(var(--border-color))"}`,
                            fontWeight: opt === q.CorrectAnswer ? 700 : 400,
                            fontSize: "13px"
                          }}>
                            {String.fromCharCode(65 + oIdx)}. {opt} {opt === q.CorrectAnswer && "✓"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
