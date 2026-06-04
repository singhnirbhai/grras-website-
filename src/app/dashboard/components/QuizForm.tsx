"use client";

import React, { memo } from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { CustomFileUpload } from "@/components/ui/CustomFileUpload";
import { Download } from "lucide-react";

interface QuizFormProps {
  uploadForm: {
    course: string;
    batch: string;
    fileName: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
  setUploadForm: React.Dispatch<React.SetStateAction<any>>;
  scheduleForm: {
    startTime: string;
    endTime: string;
    duration: number;
  };
  setScheduleForm: React.Dispatch<React.SetStateAction<any>>;
  formErrors: Record<string, string>;
  selectedFileForSchedule: any;
  selectedUploadFile: File | null;
  setSelectedUploadFile: (file: File | null) => void;
  batches: any[];
  user: any;
  onUploadSubmit: (e: React.FormEvent) => void;
  onScheduleSubmit: (e: React.FormEvent) => void;
  onDownloadTemplate: (format: "xlsx" | "csv" | "json") => void;
  onCancel: () => void;
}

export const QuizForm = memo(({
  uploadForm,
  setUploadForm,
  scheduleForm,
  setScheduleForm,
  formErrors,
  selectedFileForSchedule,
  selectedUploadFile,
  setSelectedUploadFile,
  batches,
  user,
  onUploadSubmit,
  onScheduleSubmit,
  onDownloadTemplate,
  onCancel
}: QuizFormProps) => {
  if (selectedFileForSchedule) {
    return (
      <form onSubmit={onScheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
              Start Time <span style={{ color: "hsl(var(--danger))" }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduleForm.startTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
              className="input-field"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
              End Time <span style={{ color: "hsl(var(--danger))" }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduleForm.endTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
            Duration (Minutes) <span style={{ color: "hsl(var(--danger))" }}>*</span>
          </label>
          <input
            type="number"
            min={5}
            value={scheduleForm.duration}
            onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, height: "50px" }}>
            Update Schedule
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ height: "50px", padding: "0 24px" }}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button type="button" onClick={() => onDownloadTemplate("xlsx")} className="btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>
          <Download size={12} /> Excel
        </button>
        <button type="button" onClick={() => onDownloadTemplate("csv")} className="btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>
          <Download size={12} /> CSV
        </button>
        <button type="button" onClick={() => onDownloadTemplate("json")} className="btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "11px" }}>
          <Download size={12} /> JSON
        </button>
      </div>
      <form onSubmit={onUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <CustomDropdown
          label="Target Batch"
          value={uploadForm.batch}
          options={batches
            .filter((b) => user?.role === "admin" || b.course === user?.course)
            .map((b) => ({ label: `${b.name} (${b.course})`, value: b.name }))}
          onChange={(val) => {
            const b = batches.find((b) => b.name === val);
            setUploadForm({ ...uploadForm, batch: b?.name || "", course: b?.course || "" });
          }}
          required
          error={formErrors.batch}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
            File Label <span style={{ color: "hsl(var(--danger))" }}>*</span>
          </label>
          <input
            type="text"
            value={uploadForm.fileName}
            onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
            className="input-field"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
              Start Time (IST) <span style={{ color: "hsl(var(--danger))" }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={uploadForm.startTime}
              onChange={(e) => setUploadForm({ ...uploadForm, startTime: e.target.value })}
              className="input-field"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
              End Time (IST) <span style={{ color: "hsl(var(--danger))" }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={uploadForm.endTime}
              onChange={(e) => setUploadForm({ ...uploadForm, endTime: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-secondary))" }}>
            Duration (Minutes) <span style={{ color: "hsl(var(--danger))" }}>*</span>
          </label>
          <input
            type="number"
            min={5}
            value={uploadForm.duration}
            onChange={(e) => setUploadForm({ ...uploadForm, duration: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
        <CustomFileUpload
          label="Select Questions File"
          fileName={selectedUploadFile?.name || ""}
          onChange={(file) => setSelectedUploadFile(file)}
          required
          error={formErrors.file}
        />
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, height: "50px" }}>
            Upload Exam
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ height: "50px", padding: "0 24px" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

QuizForm.displayName = "QuizForm";
