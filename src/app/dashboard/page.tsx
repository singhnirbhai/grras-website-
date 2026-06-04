"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, BookOpen, Layers, Users, Award } from "lucide-react";
import moment from "moment-timezone";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuizzes, useBatches, useFaculties } from "@/hooks/useDashboardData";

interface QuizEvent {
  fileName: string;
  Course: string;
  batch: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState<moment.Moment>(() => moment().tz("Asia/Kolkata"));
  const [selectedEvent, setSelectedEvent] = useState<QuizEvent | null>(null);

  const { data: quizzes = [] } = useQuizzes();
  const { data: batches = [] } = useBatches();
  const { data: faculties = [] } = useFaculties();

  const getFacultyName = (batchName: string) => {
    const batchObj = batches.find((b: any) => b.name === batchName);
    if (!batchObj || !batchObj.faculty) return "N/A";
    const facultyObj = faculties.find((f: any) => 
      f.email?.toLowerCase() === batchObj.faculty.toLowerCase() ||
      f.name?.toLowerCase() === batchObj.faculty.toLowerCase()
    );
    return facultyObj ? facultyObj.name : batchObj.faculty;
  };

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess) setUser(data.user);
      });
  }, []);

  // Filter quizzes according to user role
  const userQuizzes = useMemo(() => {
    if (!user) return [];
    
    if (user.role === "admin") {
      return quizzes;
    } else if (user.role === "faculty") {
      // Find batches taught by this faculty member
      const facultyBatchNames = batches
        .filter((b: any) => b.faculty?.toLowerCase() === user.email?.toLowerCase())
        .map((b: any) => b.name);
      return quizzes.filter((q: any) => facultyBatchNames.includes(q.batch));
    } else if (user.role === "student") {
      // Filter quizzes scheduled for the student's batch
      return quizzes.filter((q: any) => q.batch === user.batch);
    }
    return [];
  }, [user, quizzes, batches]);

  // Calendar calculations
  const monthStart = useMemo(() => currentDate.clone().startOf("month"), [currentDate]);
  const monthEnd = useMemo(() => currentDate.clone().endOf("month"), [currentDate]);
  const startDay = useMemo(() => monthStart.day(), [monthStart]);
  const daysInMonth = useMemo(() => currentDate.daysInMonth(), [currentDate]);

  const daysArray = useMemo(() => {
    const days = [];
    // Spacers for days before the start of this month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(currentDate.clone().date(i));
    }
    return days;
  }, [currentDate, startDay, daysInMonth]);

  const prevMonth = () => {
    setCurrentDate((prev) => prev.clone().subtract(1, "month"));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => prev.clone().add(1, "month"));
  };

  const formatTime = (isoString: string) => {
    return moment(isoString).tz("Asia/Kolkata").format("hh:mm A");
  };

  // Group events by day of the current month
  const eventsByDay = useMemo(() => {
    const map: Record<number, QuizEvent[]> = {};
    userQuizzes.forEach((quiz: any) => {
      const quizDate = moment(quiz.startTime).tz("Asia/Kolkata");
      if (quizDate.isSame(currentDate, "month")) {
        const day = quizDate.date();
        if (!map[day]) map[day] = [];
        map[day].push(quiz);
      }
    });
    return map;
  }, [userQuizzes, currentDate]);

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="animate-fade-in">
        {/* Page title and greeting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>
              Welcome back, {user?.name || "User"}
            </h1>
            <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
              {user?.role === "admin" 
                ? "Here is the master schedule of all academic batch examinations." 
                : user?.role === "faculty" 
                ? "Review scheduled assessments for cohorts assigned to you."
                : `Portal exam scheduler for cohort: ${user?.batch || "N/A"}.`}
            </p>
          </div>
        </div>

        {/* Stats view row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div className="glass" style={{ padding: "20px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: "hsl(var(--primary-light))", color: "hsl(var(--primary))", padding: "12px", borderRadius: "var(--radius-sm)" }}>
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Total Exams Scheduled</span>
              <h3 style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px" }}>{userQuizzes.length}</h3>
            </div>
          </div>
          
          <div className="glass" style={{ padding: "20px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: "hsl(var(--warning-light))", color: "hsl(var(--warning))", padding: "12px", borderRadius: "var(--radius-sm)" }}>
              <Layers size={24} />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Role Context</span>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginTop: "6px", textTransform: "capitalize" }}>{user?.role || "Loading..."}</h3>
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", padding: "24px", display: "flex", flexDirection: "column" }}>
          
          {/* Calendar Navigation header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800 }}>
              {currentDate.format("MMMM YYYY")}
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={prevMonth} className="btn-secondary" style={{ padding: "8px", height: "auto" }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentDate(moment().tz("Asia/Kolkata"))} className="btn-secondary" style={{ fontSize: "13px", height: "auto", padding: "8px 16px" }}>
                Today
              </button>
              <button onClick={nextMonth} className="btn-secondary" style={{ padding: "8px", height: "auto" }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "10px", marginBottom: "10px", textAlign: "center" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} style={{ fontSize: "12px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
                {day}
              </span>
            ))}
          </div>

          {/* Monthly grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "minmax(120px, auto)", gap: "1px", backgroundColor: "hsl(var(--border-color))" }}>
            {daysArray.map((date, idx) => {
              if (date === null) {
                return <div key={`empty-${idx}`} style={{ backgroundColor: "hsl(var(--bg-secondary))", opacity: 0.3 }} />;
              }

              const day = date.date();
              const isToday = date.isSame(moment().tz("Asia/Kolkata"), "day");
              const dayEvents = eventsByDay[day] || [];

              return (
                <div 
                  key={`day-${day}`} 
                  style={{ 
                    backgroundColor: isToday ? "hsla(var(--primary-light) / 0.3)" : "hsl(var(--bg-secondary))", 
                    padding: "8px", 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "6px",
                    position: "relative",
                    minHeight: "120px"
                  }}
                >
                  <span style={{ 
                    fontSize: "12px", 
                    fontWeight: isToday ? 800 : 600, 
                    color: isToday ? "hsl(var(--primary))" : "hsl(var(--text-primary))",
                    alignSelf: "flex-end"
                  }}>
                    {day}
                  </span>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, overflowY: "auto" }}>
                    {dayEvents.map((event, eventIdx) => (
                      <div 
                        key={eventIdx}
                        onClick={() => setSelectedEvent(event)}
                        style={{
                          backgroundColor: "hsl(var(--primary-light))",
                          color: "hsl(var(--primary))",
                          padding: "6px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          borderLeft: "3px solid hsl(var(--primary))",
                          transition: "var(--transition-fast)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                        }}
                        className="dropdown-item-hover"
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "4px" }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {event.fileName}
                          </span>
                        </div>
                        <div style={{ color: "hsl(var(--text-secondary))", fontSize: "9px", fontWeight: 500, marginTop: "2px" }}>
                          {formatTime(event.startTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details View Modal */}
      {selectedEvent && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass" style={{ width: "100%", maxWidth: "500px", padding: "32px", borderRadius: "var(--radius-lg)", backgroundColor: "hsl(var(--bg-secondary))" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>Assessment Schedule Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: "6px" }}><BookOpen size={14} /> Course</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.Course}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: "6px" }}><Layers size={14} /> Batch</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.batch}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: "6px" }}><Users size={14} /> Faculty</span>
                <span style={{ fontWeight: 600 }}>{getFacultyName(selectedEvent.batch)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: "6px" }}><Award size={14} /> Exam Title</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.fileName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> Start Time</span>
                <span style={{ fontWeight: 600 }}>{moment(selectedEvent.startTime).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> End Time</span>
                <span style={{ fontWeight: 600 }}>{moment(selectedEvent.endTime).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "8px" }}>
                <span style={{ color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> Duration</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.duration} minutes</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedEvent(null)} className="btn-primary" style={{ minWidth: "120px" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
