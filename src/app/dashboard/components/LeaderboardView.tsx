"use client";

import React, { memo } from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

interface LeaderboardViewProps {
  selectedLeaderboardFile: string;
  setSelectedLeaderboardFile: (val: string) => void;
  selectedLeaderboardBatch: string;
  setSelectedLeaderboardBatch: (val: string) => void;
  quizFiles: any[];
  batches: any[];
  leaderboardData: any[];
  user: any;
}

export const LeaderboardView = memo(({
  selectedLeaderboardFile,
  setSelectedLeaderboardFile,
  selectedLeaderboardBatch,
  setSelectedLeaderboardBatch,
  quizFiles,
  batches,
  leaderboardData,
  user
}: LeaderboardViewProps) => {
  return (
    <div>
      <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "32px", flexWrap: "wrap" }}>
        <div style={{ width: "300px" }}>
          <CustomDropdown
            label="Select Exam"
            value={selectedLeaderboardFile}
            options={quizFiles.map((f) => ({ label: f.fileName, value: f.fileName }))}
            onChange={(val) => setSelectedLeaderboardFile(val)}
            placeholder="-- Choose Quiz File --"
          />
        </div>

        <div style={{ width: "240px" }}>
          <CustomDropdown
            label="Filter by Batch"
            value={selectedLeaderboardBatch}
            options={[
              { label: "All Batches", value: "" },
              ...batches
                .filter((b) => user?.role === "admin" || b.course === user?.course)
                .map((b) => ({ label: `${b.name} (${b.course})`, value: b.name }))
            ]}
            onChange={(val) => setSelectedLeaderboardBatch(val)}
            placeholder="All Batches"
          />
        </div>
      </div>

      {selectedLeaderboardFile ? (
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border-color))", backgroundColor: "hsl(var(--primary-light))" }}>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>Rank</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 700 }}>Student Name</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>Correct Answers</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>Score Percentage</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 700 }}>Submission Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-muted))" }}>
                    No attempts found for this quiz
                  </td>
                </tr>
              ) : (
                leaderboardData.map((row, idx) => (
                  <tr
                    key={row._id}
                    style={{
                      borderBottom: "1px solid hsl(var(--border-color))",
                      backgroundColor: idx === 0 ? "rgba(251, 191, 36, 0.05)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "16px", textAlign: "center", fontWeight: 800 }}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                    </td>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{row.studentName}</td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      {row.correctCount} / {row.totalQuestions}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center", fontWeight: 800, color: "hsl(var(--success))" }}>
                      {row.score.toFixed(1)}%
                    </td>
                    <td style={{ padding: "16px", color: "hsl(var(--text-secondary))", fontSize: "12px" }}>
                      {row.submittedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
          Choose an exam file above to display the scoreboard leaderboard.
        </div>
      )}
    </div>
  );
});

LeaderboardView.displayName = "LeaderboardView";
