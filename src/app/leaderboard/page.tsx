"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Trophy, Award } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuizzes, useBatches, useLeaderboard, useFaculties } from "@/hooks/useDashboardData";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export default function LeaderboardPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedLeaderboardFile, setSelectedLeaderboardFile] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuccess) setUser(data.user);
      });
  }, []);

  const { data: faculties = [] } = useFaculties();
  const { data: batches = [] } = useBatches();
  const { data: quizFiles = [] } = useQuizzes();
  const { data: leaderboardData = [] } = useLeaderboard(selectedLeaderboardFile, selectedBatch);

  // Filter batches based on user role context & selected faculty
  const filteredBatchesForUser = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") {
      if (!selectedFaculty) return batches;
      const facultyObj = faculties.find((f: any) => f.email === selectedFaculty || f._id === selectedFaculty);
      const facultyEmail = facultyObj?.email?.toLowerCase().trim();
      const facultyName = facultyObj?.name?.toLowerCase().trim();

      return batches.filter((b: any) => {
        const bf = b.faculty?.toLowerCase().trim();
        return bf === facultyEmail || bf === facultyName;
      });
    } else if (user.role === "faculty") {
      return batches.filter((b: any) => 
        b.faculty?.toLowerCase() === user.email?.toLowerCase() ||
        b.faculty?.toLowerCase() === user.name?.toLowerCase()
      );
    } else if (user.role === "student") {
      return batches.filter((b: any) => b.name === user.batch);
    }
    return [];
  }, [user, batches, selectedFaculty, faculties]);

  // Auto-select batch for student or single-batch faculty
  useEffect(() => {
    if (user && filteredBatchesForUser.length > 0) {
      if (user.role === "student" && user.batch) {
        setSelectedBatch(user.batch);
      } else if (user.role === "faculty" && filteredBatchesForUser.length === 1) {
        setSelectedBatch(filteredBatchesForUser[0].name);
      }
    }
  }, [user, filteredBatchesForUser]);

  // Filter quizzes according to the selected batch
  const filteredQuizzes = useMemo(() => {
    if (!selectedBatch) return [];
    return quizFiles.filter((q: any) => q.batch === selectedBatch);
  }, [quizFiles, selectedBatch]);

  const handleFacultyChange = (facultyVal: string) => {
    setSelectedFaculty(facultyVal);
    setSelectedBatch("");
    setSelectedLeaderboardFile("");
  };

  const handleBatchChange = (batchVal: string) => {
    setSelectedBatch(batchVal);
    setSelectedLeaderboardFile(""); // Reset quiz selection on batch change
  };

  return (
    <DashboardLayout activeTab="leaderboard">
      <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>Leaderboards</h1>
            <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>Compare student ranking standings.</p>
          </div>
        </div>

        <div className="glass" style={{ padding: "24px 32px", borderRadius: "var(--radius-lg)", marginBottom: "32px", zIndex: 5, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {user?.role === "admin" && (
            <CustomDropdown
              label="Filter Faculty"
              value={selectedFaculty}
              options={[{ label: "All Faculties", value: "" }, ...faculties.map((f: any) => ({ label: `${f.name} (${f.course})`, value: f.email }))]}
              onChange={handleFacultyChange}
              placeholder="-- Choose Faculty (All) --"
            />
          )}
          <CustomDropdown
            label="Filter Cohort Batch"
            value={selectedBatch}
            options={[{ label: "All Batches", value: "" }, ...filteredBatchesForUser.map((b: any) => ({ label: b.name, value: b.name }))]}
            onChange={handleBatchChange}
            placeholder="-- Choose Batch --"
            disabled={user?.role === "student"}
          />
          <CustomDropdown
            label="Filter Assessment Quiz"
            value={selectedLeaderboardFile}
            options={filteredQuizzes.map((q: any) => ({ label: q.fileName, value: q.fileName }))}
            onChange={(val) => setSelectedLeaderboardFile(val)}
            placeholder={selectedBatch ? "-- Choose Assessment Quiz --" : "-- Select a Batch First --"}
            disabled={!selectedBatch}
          />
        </div>

        {selectedLeaderboardFile ? (
          <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border-color))", display: "flex", alignItems: "center", gap: "8px" }}>
              <Trophy size={20} style={{ color: "hsl(var(--warning))" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Rankings Standings - {selectedLeaderboardFile}</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>
                    <th style={{ padding: "16px 24px" }}>Rank</th>
                    <th style={{ padding: "16px 24px" }}>Student</th>
                    <th style={{ padding: "16px 24px" }}>Batch</th>
                    <th style={{ padding: "16px 24px", textAlign: "right" }}>Correct / Wrong / Total</th>
                    <th style={{ padding: "16px 24px", textAlign: "right" }}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>No rankings records available.</td>
                    </tr>
                  ) : (
                    leaderboardData.map((row: any, index: number) => {
                      const isTop3 = index < 3;
                      const badgeColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
                      return (
                        <tr key={index} style={{ borderBottom: "1px solid hsl(var(--border-color))", transition: "var(--transition-fast)" }} className="dropdown-item-hover">
                          <td style={{ padding: "16px 24px" }}>
                            {isTop3 ? (
                              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: badgeColors[index] + "22", color: badgeColors[index], fontWeight: 800 }}>
                                {index + 1}
                              </div>
                            ) : (
                              <span style={{ fontWeight: 500, color: "hsl(var(--text-secondary))", paddingLeft: "10px" }}>{index + 1}</span>
                            )}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {index === 0 && <Award size={16} style={{ color: "hsl(var(--warning))" }} />}
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontWeight: 600 }}>{row.studentName}</span>
                                <span style={{ fontSize: "11px", color: "hsl(var(--text-secondary))" }}>{row.userId}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px", color: "hsl(var(--text-secondary))" }}>{row.batch || "N/A"}</td>
                          <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 700, color: "hsl(var(--primary))" }}>
                            {row.correctCount || 0} / {(row.totalQuestions || 0) - (row.correctCount || 0)} / {row.totalQuestions || 0}
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 700, color: "hsl(var(--primary))" }}>
                            {row.score?.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ padding: "64px", textAlign: "center", color: "hsl(var(--text-muted))" }}>
            Select an assessment quiz to view rankings.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
