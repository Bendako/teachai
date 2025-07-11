"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface EmailManagementProps {
  studentId: Id<"students">;
  studentName: string;
  parentEmail?: string;
  teacherId: Id<"users">;
  onClose: () => void;
}

export function EmailManagement({ 
  studentId, 
  studentName, 
  parentEmail, 
  teacherId, 
  onClose 
}: EmailManagementProps) {
  const [emailType, setEmailType] = useState<"lesson" | "weekly">("lesson");
  const [isLoading, setIsLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendWeeklyReport = useAction(api.emails.sendWeeklyProgressReport);

  const handleSendEmail = async () => {
    if (!parentEmail) {
      setEmailResult({ success: false, message: "No parent email address on file" });
      return;
    }

    setIsLoading(true);
    setEmailResult(null);

    try {
      if (emailType === "weekly") {
        const result = await sendWeeklyReport({
          studentId,
          teacherId,
        });
        
        setEmailResult({
          success: result.success,
          message: result.success 
            ? "Weekly progress report sent successfully!"
            : result.error || "Failed to send weekly report"
        });
      } else {
        // For lesson summary, we need the most recent completed lesson
        setEmailResult({
          success: false,
          message: "Lesson summary emails are sent automatically when lessons are completed"
        });
      }
    } catch (error) {
      setEmailResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Management</h2>
          <p className="text-gray-600 mt-1">Send updates to {studentName}&apos;s parent</p>
        </div>
        <Button variant="outline" onClick={onClose} className="font-medium">
          ✕ Close
        </Button>
      </div>

      {/* Parent Email Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📧 Parent Contact</h3>
        {parentEmail ? (
          <p className="text-blue-800">
            <strong>Email:</strong> {parentEmail}
          </p>
        ) : (
          <p className="text-red-600">
            ⚠️ No parent email address on file. Please update student information.
          </p>
        )}
      </div>

      {/* Email Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Email Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmailTypeCard
            title="📝 Lesson Summary"
            description="Automatic email sent after each completed lesson with skills assessment, topics covered, and homework."
            isSelected={emailType === "lesson"}
            onSelect={() => setEmailType("lesson")}
            isAutomatic={true}
          />
          
          <EmailTypeCard
            title="📊 Weekly Progress Report"
            description="Comprehensive weekly summary showing progress trends, completed lessons, and recommendations."
            isSelected={emailType === "weekly"}
            onSelect={() => setEmailType("weekly")}
            isAutomatic={false}
          />
        </div>
      </div>

      {/* Email Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Email Content Preview</h3>
        <EmailPreview type={emailType} studentName={studentName} />
      </div>

      {/* Send Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {emailType === "lesson" ? (
            "Lesson summaries are sent automatically when you complete a lesson"
          ) : (
            "Weekly reports can be sent manually or scheduled"
          )}
        </div>
        
        <div className="space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          {emailType === "weekly" && (
            <Button
              onClick={handleSendEmail}
              disabled={!parentEmail || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Sending..." : "Send Weekly Report"}
            </Button>
          )}
        </div>
      </div>

      {/* Email Result */}
      {emailResult && (
        <div className={`p-4 rounded-lg border ${
          emailResult.success 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {emailResult.success ? "✅" : "❌"}
            </span>
            {emailResult.message}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailTypeCard({ 
  title, 
  description, 
  isSelected, 
  onSelect, 
  isAutomatic 
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  isAutomatic: boolean;
}) {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? "border-blue-500 bg-blue-50 shadow-md" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {isAutomatic && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Auto
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function EmailPreview({ type, studentName }: { type: "lesson" | "weekly"; studentName: string }) {
  if (type === "lesson") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Lesson Summary Email Preview</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div><strong>Subject:</strong> {studentName}&apos;s English Lesson Summary - [Date]</div>
          <div><strong>Content includes:</strong></div>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Skills assessment with scores (Reading, Writing, Speaking, etc.)</li>
            <li>Topics covered during the lesson</li>
            <li>Teacher&apos;s notes and observations</li>
            <li>Homework assignment (if given)</li>
            <li>Next steps and recommendations</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Weekly Progress Report Preview</h4>
      <div className="space-y-2 text-sm text-gray-700">
        <div><strong>Subject:</strong> {studentName}&apos;s Weekly English Progress Report</div>
        <div><strong>Content includes:</strong></div>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Number of lessons completed this week</li>
          <li>Average skills scores with progress trends</li>
          <li>Skills progression charts and improvements</li>
          <li>Summary of topics covered</li>
          <li>Overall progress assessment</li>
          <li>Recommendations for continued learning</li>
        </ul>
      </div>
    </div>
  );
}

// Hook for automatic email notifications after lesson completion
// This will be integrated into the progress tracker component
export function useAutoEmailNotification() {
  const sendLessonSummary = useAction(api.emails.sendLessonSummaryEmail);
  
  const sendAutoEmail = async (
    studentId: Id<"students">,
    lessonId: Id<"lessons">,
    progressId: Id<"progress">,
    teacherId: Id<"users">
  ) => {
    try {
      const result = await sendLessonSummary({
        studentId,
        lessonId,
        progressId,
        teacherId,
      });
      return result;
    } catch {
      return { success: false, error: "Failed to send email" };
    }
  };
  
  return { sendAutoEmail };
} 