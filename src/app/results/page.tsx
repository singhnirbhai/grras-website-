"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Eye, Trash2, Calendar, Clock, Trophy, ChevronLeft, CheckCircle2, XCircle, Award } from "lucide-react";
import Swal from "sweetalert2";
import moment from "moment-timezone";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useResults } from "@/hooks/useDashboardData";

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultsPage, setResultsPage] = useState(1);
  const [viewState, setViewState] = useState<"list" | "students" | "detail">("list");
  const [selectedQuizName, setSelectedQuizName] = useState<string>("");
  const [selectedStudentResult, setSelectedStudentResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess) setUser(data.user);
      });
  }, []);

  const { data: results = [], refetch: refetchResults } = useResults();
  const ITEMS_PER_PAGE = 10;

  // Auto-refresh ongoing results when they end
  useEffect(() => {
    const ongoing = results.filter((r: any) => r.isQuizOngoing && r.endTime);
    if (ongoing.length === 0) return;

    const timers = ongoing.map((r: any) => {
      const endMs = new Date(r.endTime).getTime();
      const nowMs = Date.now();
      const delay = Math.max(endMs - nowMs + 2000, 1000); // 2-second buffer

      if (delay < 3600000) {
        return setTimeout(() => {
          refetchResults();
        }, delay);
      }
      return null;
    }).filter(Boolean);

    return () => {
      timers.forEach((t: any) => clearTimeout(t));
    };
  }, [results, refetchResults]);

  const isAdminOrFaculty = user?.role === "admin" || user?.role === "faculty";

  // Grouped results for Admin/Faculty landing page
  const groupedQuizzes = useMemo(() => {
    if (!isAdminOrFaculty) return [];
    
    const groups: Record<string, { fileName: string; submissionsCount: number; totalScore: number; resultsList: any[] }> = {};
    
    results.forEach((r: any) => {
      if (!groups[r.fileName]) {
        groups[r.fileName] = {
          fileName: r.fileName,
          submissionsCount: 0,
          totalScore: 0,
          resultsList: [],
        };
      }
      groups[r.fileName].submissionsCount += 1;
      groups[r.fileName].totalScore += r.score || 0;
      groups[r.fileName].resultsList.push(r);
    });

    return Object.values(groups).filter((g) =>
      g.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm, isAdminOrFaculty]);

  // Students list for a specific quiz (Admin/Faculty second page)
  const studentsForSelectedQuiz = useMemo(() => {
    if (!selectedQuizName) return [];
    const quizSubmissions = results.filter((r: any) => r.fileName === selectedQuizName);
    return quizSubmissions.filter(
      (r: any) =>
        r.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student?.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, selectedQuizName, searchTerm]);

  // Student own results list (Student landing page)
  const studentOwnResults = useMemo(() => {
    if (isAdminOrFaculty) return [];
    return results.filter((r: any) =>
      r.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm, isAdminOrFaculty]);

  const handleDeleteResult = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = await Swal.fire({
      title: "Delete Result?",
      text: "This action will permanently delete the result record",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/quiz/results?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Deleted", "Result record deleted", "success");
        refetchResults();
      }
    }
  };

  const formatIST = (utcDate: string) => {
    return moment(utcDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm");
  };

  // Reset pagination when view or search changes
  useEffect(() => {
    setResultsPage(1);
  }, [viewState, searchTerm, selectedQuizName]);

  return (
    <DashboardLayout activeTab="results">
      <div className="animate-fade-in">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Quiz Results</h1>
            <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
              {isAdminOrFaculty 
                ? "Monitor portal student performance and review detailed test submissions." 
                : "View your completed quiz results and detailed answer sheets."}
            </p>
          </div>
        </div>

        {/* VIEW 1: ADMIN/FACULTY LANDING - GROUPED BY QUIZ */}
        {isAdminOrFaculty && viewState === "list" && (
          <div>
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  style={{ maxWidth: "320px", height: "40px" }}
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>
                      <th style={{ padding: "16px 24px" }}>No.</th>
                      <th style={{ padding: "16px 24px" }}>Quiz Label / Name</th>
                      <th style={{ padding: "16px 24px" }}>Total Submissions</th>
                      <th style={{ padding: "16px 24px" }}>Average Score</th>
                      <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedQuizzes.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No quiz results available.</td>
                      </tr>
                    ) : (
                      groupedQuizzes.map((quiz, idx) => (
                        <tr
                          key={quiz.fileName}
                          onClick={() => {
                            setSelectedQuizName(quiz.fileName);
                            setSearchTerm("");
                            setViewState("students");
                          }}
                          style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }}
                          className="dropdown-item-hover"
                        >
                          <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{idx + 1}</td>
                          <td style={{ padding: "16px 24px", fontWeight: 700 }}>{quiz.fileName}</td>
                          <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>
                            {quiz.submissionsCount} student(s)
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              backgroundColor: (quiz.totalScore / quiz.submissionsCount) >= 50 ? "hsl(var(--success-light))" : "hsl(var(--danger-light))",
                              color: (quiz.totalScore / quiz.submissionsCount) >= 50 ? "hsl(var(--success))" : "hsl(var(--danger))"
                            }}>
                              {(quiz.totalScore / quiz.submissionsCount).toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }}>
                            <button
                              className="btn-secondary"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12px", height: "auto" }}
                            >
                              <Eye size={14} /> View Submissions
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ADMIN/FACULTY - STUDENT LIST FOR SELECTED QUIZ */}
        {isAdminOrFaculty && viewState === "students" && (
          <div>
            <button
              onClick={() => {
                setViewState("list");
                setSelectedQuizName("");
                setSearchTerm("");
              }}
              className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", height: "40px" }}
            >
              <ChevronLeft size={16} /> Back to Quizzes
            </button>

            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
              Submissions for Quiz: <span style={{ color: "hsl(var(--primary))" }}>{selectedQuizName}</span>
            </h2>

            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  style={{ maxWidth: "320px", height: "40px" }}
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>
                      <th style={{ padding: "16px 24px" }}>No.</th>
                      <th style={{ padding: "16px 24px" }}>Student</th>
                      <th style={{ padding: "16px 24px" }}>Batch</th>
                      <th style={{ padding: "16px 24px" }}>Correct / Wrong / Total</th>
                      <th style={{ padding: "16px 24px" }}>Score (Percentage)</th>
                      <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsForSelectedQuiz.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No student submissions found.</td>
                      </tr>
                    ) : (
                      studentsForSelectedQuiz.map((res: any, idx: number) => (
                        <tr
                          key={res._id}
                          onClick={() => {
                            setSelectedStudentResult(res);
                            setViewState("detail");
                          }}
                          style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }}
                          className="dropdown-item-hover"
                        >
                          <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{idx + 1}</td>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontWeight: 600 }}>{res.student?.name}</span>
                              <span style={{ fontSize: "11px", color: "hsl(var(--text-secondary))" }}>{res.student?.userId}</span>
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{res.student?.batch}</td>
                          <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                            {res.correctCount || 0} / {(res.totalQuestions || 0) - (res.correctCount || 0)} / {res.totalQuestions || 0}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              backgroundColor: res.score >= 50 ? "hsl(var(--success-light))" : "hsl(var(--danger-light))",
                              color: res.score >= 50 ? "hsl(var(--success))" : "hsl(var(--danger))"
                            }}>
                              {res.score?.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => {
                                  setSelectedStudentResult(res);
                                  setViewState("detail");
                                }}
                                className="btn-secondary"
                                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}
                              >
                                <Eye size={14} /> View Answers
                              </button>
                              <button
                                onClick={(e) => handleDeleteResult(res._id, e)}
                                className="btn-secondary"
                                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: STUDENT LANDING VIEW */}
        {!isAdminOrFaculty && viewState === "list" && (
          <div>
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  style={{ maxWidth: "320px", height: "40px" }}
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>
                      <th style={{ padding: "16px 24px" }}>No.</th>
                      <th style={{ padding: "16px 24px" }}>Quiz Label / Name</th>
                      <th style={{ padding: "16px 24px" }}>Submission Time</th>
                      <th style={{ padding: "16px 24px" }}>Correct / Wrong / Total</th>
                      <th style={{ padding: "16px 24px" }}>Score (Percentage)</th>
                      <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentOwnResults.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No quiz submissions yet.</td>
                      </tr>
                    ) : (
                      studentOwnResults.map((res: any, idx: number) => (
                        <tr
                          key={res._id}
                          onClick={() => {
                            setSelectedStudentResult(res);
                            setViewState("detail");
                          }}
                          style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)", cursor: "pointer" }}
                          className="dropdown-item-hover"
                        >
                          <td style={{ padding: "16px 24px", fontWeight: 700, color: "hsl(var(--primary))" }}>{idx + 1}</td>
                          <td style={{ padding: "16px 24px", fontWeight: 600 }}>{res.fileName}</td>
                          <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{formatIST(res.createdAt)}</td>
                          <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                            {res.correctCount === null ? "Hidden" : `${res.correctCount} / ${(res.totalQuestions || 0) - (res.correctCount || 0)} / ${res.totalQuestions || 0}`}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            {res.score === null ? (
                              <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, backgroundColor: "hsl(var(--warning-light))", color: "hsl(var(--warning))" }}>
                                Hidden until quiz ends
                              </span>
                            ) : (
                              <span style={{
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 700,
                                backgroundColor: res.score >= 50 ? "hsl(var(--success-light))" : "hsl(var(--danger-light))",
                                color: res.score >= 50 ? "hsl(var(--success))" : "hsl(var(--danger))"
                              }}>
                                {res.score?.toFixed(1)}%
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedStudentResult(res);
                                setViewState("detail");
                              }}
                              className="btn-secondary"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", height: "auto", color: "hsl(var(--primary))", borderColor: "rgba(var(--primary), 0.2)" }}
                            >
                              <Eye size={14} /> View Detailed Answers
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: DETAILED ANSWERS PAGE (FOR BOTH STUDENT & ADMIN/FACULTY) */}
        {viewState === "detail" && selectedStudentResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <button
                onClick={() => {
                  setViewState(isAdminOrFaculty ? "students" : "list");
                  setSelectedStudentResult(null);
                }}
                className="btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", height: "40px" }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            </div>

            {/* Score Overview Panel */}
            <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800 }}>Detailed Answer Report</h2>
                <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>
                  Student: <strong style={{ color: "hsl(var(--text-primary))" }}>{selectedStudentResult.student?.name}</strong> ({selectedStudentResult.student?.userId})
                </p>
                <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>
                  Quiz: <strong style={{ color: "hsl(var(--text-primary))" }}>{selectedStudentResult.fileName}</strong>
                </p>
                <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>
                  Completed: <span>{formatIST(selectedStudentResult.createdAt)}</span>
                </p>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: selectedStudentResult.score === null ? "hsl(var(--warning-light))" : (selectedStudentResult.score >= 50 ? "hsl(var(--success-light))" : "hsl(var(--danger-light))"),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `3px solid ${selectedStudentResult.score === null ? "hsl(var(--warning))" : (selectedStudentResult.score >= 50 ? "hsl(var(--success))" : "hsl(var(--danger))")}`
                }}>
                  <span style={{ fontSize: selectedStudentResult.score === null ? "14px" : "20px", fontWeight: 800, color: selectedStudentResult.score === null ? "hsl(var(--warning))" : (selectedStudentResult.score >= 50 ? "hsl(var(--success))" : "hsl(var(--danger))"), textAlign: "center", padding: "4px" }}>
                    {selectedStudentResult.score === null ? "Hidden" : `${selectedStudentResult.score?.toFixed(1)}%`}
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "hsl(var(--text-muted))", textTransform: "uppercase" }}>Score</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "hsl(var(--success))" }}>
                    <CheckCircle2 size={16} /> {selectedStudentResult.correctCount === null ? "Hidden" : `${selectedStudentResult.correctCount} Correct Answers`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "hsl(var(--danger))" }}>
                    <XCircle size={16} /> {selectedStudentResult.correctCount === null ? "Hidden" : `${(selectedStudentResult.totalQuestions || 0) - (selectedStudentResult.correctCount || 0)} Incorrect Answers`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
                    <Trophy size={16} /> {selectedStudentResult.totalQuestions} Total Questions
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "8px 0" }}>Question Breakdown</h3>
              {selectedStudentResult.results && selectedStudentResult.results.length > 0 ? (
                selectedStudentResult.results.map((qItem: any, idx: number) => {
                  const isPending = qItem.isCorrect === null;
                  const isCorrect = !isPending && (qItem.isCorrect || qItem.selectedAnswer === qItem.correctAnswer);
                  return (
                    <div
                      key={idx}
                      className="glass animate-fade-in"
                      style={{
                        padding: "24px",
                        borderRadius: "var(--radius-md)",
                        borderLeft: `5px solid ${isPending ? "hsl(var(--warning))" : (isCorrect ? "hsl(var(--success))" : "hsl(var(--danger))")}`,
                        backgroundColor: "hsl(var(--bg-secondary))"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 700, lineHeight: "1.5" }}>
                          Question {idx + 1}: {qItem.question}
                        </h4>
                        {!isPending && (
                          <div>
                            {isCorrect ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: "hsl(var(--success-light))", color: "hsl(var(--success))", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>
                                <CheckCircle2 size={12} /> Correct
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: "hsl(var(--danger-light))", color: "hsl(var(--danger))", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>
                                <XCircle size={12} /> Incorrect
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "13px",
                          backgroundColor: isPending ? "hsl(var(--warning-light))" : (isCorrect ? "hsl(var(--success-light))" : "hsl(var(--danger-light))"),
                          color: isPending ? "hsl(var(--warning))" : (isCorrect ? "hsl(var(--success))" : "hsl(var(--danger))"),
                          border: `1px solid ${isPending ? "rgba(var(--warning), 0.2)" : (isCorrect ? "rgba(var(--success), 0.2)" : "rgba(var(--danger), 0.2)")}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <span><strong>Your Answer:</strong> {qItem.selectedAnswer || "Not Answered"}</span>
                        </div>

                        {!isPending && !isCorrect && (
                          <div style={{
                            padding: "10px 14px",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "13px",
                            backgroundColor: "hsl(var(--success-light))",
                            color: "hsl(var(--success))",
                            border: "1px solid rgba(var(--success), 0.2)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <span><strong>Correct Answer:</strong> {qItem.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="glass" style={{ padding: "24px", textAlign: "center", color: "hsl(var(--text-muted))" }}>
                  Detailed breakdown not available for this record.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
