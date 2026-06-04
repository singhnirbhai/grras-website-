"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, Timer, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import moment from "moment-timezone";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuizzes, useResults } from "@/hooks/useDashboardData";

export default function AvailableExamsPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingManual, setIsLoadingManual] = useState(false);

  // Exam Taker State
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [activeExamFile, setActiveExamFile] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess) setUser(data.user);
      });
  }, []);

  const [now, setNow] = useState(moment().tz("Asia/Kolkata"));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(moment().tz("Asia/Kolkata"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: quizFiles = [] } = useQuizzes();
  const { refetch: refetchResults } = useResults();

  // Filter quizzes by search term AND student's assigned course case-insensitively
  const filteredQuizFiles = useMemo(() => {
    if (!user) return [];
    // If student, filter by course
    const courseQuizzes = quizFiles.filter((q: any) => q.Course?.toLowerCase() === user.course?.toLowerCase());
    const searched = courseQuizzes.filter((q: any) =>
      q.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Filter out exams that have already completed/ended
    return searched.filter((q: any) => {
      const endMoment = moment(q.endTime).tz("Asia/Kolkata");
      return !now.isAfter(endMoment);
    });
  }, [quizFiles, user, searchTerm, now]);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitExam(true); // force auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  const handleStartExamFlow = async (file: any) => {
    setIsLoadingManual(true);
    try {
      // 1. Fetch questions for file
      const questionsRes = await fetch(`/api/quiz?fileName=${encodeURIComponent(file.fileName)}`);
      const questionsData = await questionsRes.json();

      if (!questionsData.isSuccess || !questionsData.data.length) {
        Swal.fire("Error", "Failed to load exam questions", "error");
        return;
      }

      // 2. Fetch leaderboard / check submission state
      const checkRes = await fetch(`/api/quiz/leaderboard?fileName=${encodeURIComponent(file.fileName)}`);
      const checkData = await checkRes.json();

      if (checkData.isSuccess && checkData.data.hasSubmitted) {
        Swal.fire("Exceeded Attempts", "You have already submitted this exam.", "error");
        return;
      }

      const shuffleArray = (arr: any[]) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const randomizedQuestions = shuffleArray(questionsData.data).map((q: any) => ({
        ...q,
        Options: shuffleArray(q.Options || []),
      }));

      setActiveExamFile(file.fileName);
      setTimeLeft(file.duration * 60);
      setAnswers({});
      setCurrentQuestion(0);
      setExamQuestions(randomizedQuestions);
      setExamStarted(true);
    } catch (e) {
      Swal.fire("Error", "Failed to start exam", "error");
    } finally {
      setIsLoadingManual(false);
    }
  };

  const handleQuitExamFlow = async () => {
    const confirm = await Swal.fire({
      title: "Quit Exam?",
      text: "Are you sure you want to quit the exam? Your current progress/answers will be submitted and you won't be able to re-enter.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--danger))",
      confirmButtonText: "Yes, quit and submit",
    });
    if (confirm.isConfirmed) {
      submitExam(true);
    }
  };

  const submitExam = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const confirm = await Swal.fire({
        title: "Submit Exam?",
        text: "Are you sure you want to finish the exam?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "hsl(var(--success))",
      });
      if (!confirm.isConfirmed) return;
    }

    setIsLoadingManual(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        selectedAnswer: val,
      }));

      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: activeExamFile,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (data.isSuccess) {
        Swal.fire("Submitted", "Exam completed. Results have been emailed.", "success");
        setExamStarted(false);
        refetchResults();
        window.location.href = "/results";
      } else {
        Swal.fire("Error", data.message || "Submission failed", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Failed to submit exam", "error");
    } finally {
      setIsLoadingManual(false);
    }
  };

  const formatIST = (utcDate: string) => {
    return moment(utcDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm");
  };

  return (
    <DashboardLayout activeTab="available_exams">
      <div className="animate-fade-in">
        {examStarted ? (
          /* ACTIVE EXAM INTERFACE */
          <div className="glass animate-fade-in" style={{ borderRadius: "var(--radius-lg)", padding: "40px", border: "1px solid hsl(var(--success))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800 }}>{activeExamFile}</h2>
                <p style={{ color: "hsl(var(--text-secondary))", fontSize: "13px" }}>Question {currentQuestion + 1} of {examQuestions.length}</p>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "hsl(var(--danger-light))", color: "hsl(var(--danger))", borderRadius: "20px", fontWeight: 700 }}>
                  <Timer size={18} className="animate-pulse-soft" />
                  <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: "6px", width: "100%", backgroundColor: "hsl(var(--primary-light))", borderRadius: "3px", overflow: "hidden", marginBottom: "32px" }}>
              <div style={{ height: "100%", width: `${((currentQuestion + 1) / examQuestions.length) * 100}%`, backgroundColor: "hsl(var(--primary))", transition: "width var(--transition-fast)" }} />
            </div>

            {/* Question Box */}
            <div style={{ backgroundColor: "hsl(var(--bg-primary))", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-color))", marginBottom: "24px" }}>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "hsl(var(--text-primary))", lineHeight: "1.6" }}>
                {examQuestions[currentQuestion]?.Question}
              </p>
            </div>

            {/* Options Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
              {examQuestions[currentQuestion]?.Options.map((opt: string, idx: number) => {
                const qId = examQuestions[currentQuestion]._id;
                const isSelected = answers[qId] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [qId]: opt })}
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      backgroundColor: isSelected ? "hsl(var(--primary-light))" : "hsl(var(--bg-secondary))",
                      border: isSelected ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border-color))",
                      borderRadius: "var(--radius-md)",
                      color: isSelected ? "hsl(var(--primary))" : "hsl(var(--text-primary))",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "var(--transition-fast)",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn-secondary"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => prev - 1)}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  className="btn-secondary"
                  style={{ color: "hsl(var(--danger))", borderColor: "rgba(var(--danger), 0.2)" }}
                  onClick={handleQuitExamFlow}
                >
                  Quit Exam
                </button>
              </div>

              {currentQuestion < examQuestions.length - 1 ? (
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  >
                    Skip
                  </button>
                  <button className="btn-primary" onClick={() => setCurrentQuestion((prev) => prev + 1)}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <button className="btn-primary" style={{ backgroundColor: "hsl(var(--success))" }} onClick={() => submitExam(false)}>
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <div>
                <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Available Exams</h1>
                <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Select and complete scheduled assessments.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {filteredQuizFiles.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  No scheduled exams available for your course at this moment.
                </div>
              ) : (
                filteredQuizFiles.map((q: any, idx: number) => {
                  const startMoment = moment(q.startTime).tz("Asia/Kolkata");
                  const endMoment = moment(q.endTime).tz("Asia/Kolkata");
                  const hasStarted = now.isSameOrAfter(startMoment);
                  const hasEnded = now.isAfter(endMoment);

                  let countdownText = "";
                  if (!hasStarted) {
                    const durationUntilStart = moment.duration(startMoment.diff(now));
                    const days = Math.floor(durationUntilStart.asDays());
                    const hours = durationUntilStart.hours();
                    const minutes = durationUntilStart.minutes();
                    const seconds = durationUntilStart.seconds();
                    countdownText = days > 0 
                      ? `${days}d ${hours}h ${minutes}m` 
                      : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                  } else if (!hasEnded) {
                    const durationUntilEnd = moment.duration(endMoment.diff(now));
                    const days = Math.floor(durationUntilEnd.asDays());
                    const hours = durationUntilEnd.hours();
                    const minutes = durationUntilEnd.minutes();
                    const seconds = durationUntilEnd.seconds();
                    countdownText = days > 0 
                      ? `${days}d ${hours}h ${minutes}m` 
                      : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                  }

                  return (
                    <div key={idx} className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          {hasStarted ? (
                            <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 8px", backgroundColor: "hsl(var(--success-light))", color: "hsl(var(--success))", borderRadius: "12px", textTransform: "uppercase" }}>
                              Active Exam
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 8px", backgroundColor: "hsl(var(--warning-light))", color: "hsl(var(--warning))", borderRadius: "12px", textTransform: "uppercase" }}>
                              Scheduled
                            </span>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "hsl(var(--text-secondary))", fontSize: "12px" }}>
                            <Clock size={14} />
                            <span>{q.duration} min</span>
                          </div>
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>{q.fileName}</h3>
                        <p style={{ fontSize: "12px", color: "hsl(var(--text-secondary))", marginBottom: "16px" }}>
                          Course: <strong>{q.Course}</strong>
                        </p>
                        <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "24px" }}>
                          <span>Start: {formatIST(q.startTime)} IST</span>
                          <span>End: {formatIST(q.endTime)} IST</span>
                          {!hasStarted && (
                            <span style={{ color: "hsl(var(--warning))", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                              Starts in: {countdownText}
                            </span>
                          )}
                          {hasStarted && !hasEnded && (
                            <span style={{ color: "hsl(var(--success))", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                              Ends in: {countdownText}
                            </span>
                          )}
                        </div>
                      </div>

                      {hasStarted ? (
                        <button className="btn-primary" style={{ width: "100%" }} onClick={() => handleStartExamFlow(q)}>
                          Start exam
                        </button>
                      ) : (
                        <div style={{
                          width: "100%",
                          padding: "12px",
                          textAlign: "center",
                          backgroundColor: "hsl(var(--warning-light))",
                          color: "hsl(var(--warning))",
                          borderRadius: "var(--radius-md)",
                          fontWeight: 700,
                          fontSize: "14px",
                          border: "1px dashed hsl(var(--warning))"
                        }}>
                          Starts in {countdownText}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
