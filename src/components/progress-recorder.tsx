"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface ProgressRecorderProps {
  lessonId: Id<"lessons">;
  studentId: Id<"students">;
  teacherId: Id<"users">;
  onProgressSaved?: (progressId: Id<"progress">) => void;
  onClose: () => void;
  initialProgress?: {
    skills: {
      reading: number;
      writing: number;
      speaking: number;
      listening: number;
      grammar: number;
      vocabulary: number;
    };
    topicsCovered: string[];
    notes: string;
    homework?: {
      assigned: string;
      completed: boolean;
      feedback?: string;
    };
  };
}

export function ProgressRecorder({
  lessonId,
  studentId,
  teacherId,
  onProgressSaved,
  onClose,
  initialProgress
}: ProgressRecorderProps) {
  const [skills, setSkills] = useState({
    reading: initialProgress?.skills.reading || 5,
    writing: initialProgress?.skills.writing || 5,
    speaking: initialProgress?.skills.speaking || 5,
    listening: initialProgress?.skills.listening || 5,
    grammar: initialProgress?.skills.grammar || 5,
    vocabulary: initialProgress?.skills.vocabulary || 5,
  });

  const [topicsCovered, setTopicsCovered] = useState<string[]>(
    initialProgress?.topicsCovered || []
  );
  const [newTopic, setNewTopic] = useState("");
  const [notes, setNotes] = useState(initialProgress?.notes || "");
  const [homework, setHomework] = useState({
    assigned: initialProgress?.homework?.assigned || "",
    completed: initialProgress?.homework?.completed || false,
    feedback: initialProgress?.homework?.feedback || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const createProgress = useMutation(api.progress.createProgress);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSkillChange = (skill: keyof typeof skills, value: number) => {
    setSkills(prev => ({
      ...prev,
      [skill]: Math.max(1, Math.min(10, value))
    }));
  };

  const addTopic = () => {
    if (newTopic.trim() && !topicsCovered.includes(newTopic.trim())) {
      setTopicsCovered(prev => [...prev, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (topic: string) => {
    setTopicsCovered(prev => prev.filter(t => t !== topic));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const progressId = await createProgress({
        lessonId,
        studentId,
        teacherId,
        skills,
        topicsCovered,
        notes,
        homework: homework.assigned ? homework : undefined,
      });

      onProgressSaved?.(progressId);
      onClose();
    } catch (error) {
      console.error("Failed to save progress:", error);
      alert("Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  const getSkillColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getSkillDescription = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Fair";
    if (score >= 5) return "Average";
    if (score >= 4) return "Below Average";
    if (score >= 3) return "Poor";
    return "Very Poor";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Record Lesson Progress</h2>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Skills Assessment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Assessment (1-10)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(skills).map(([skill, score]) => (
                <div key={skill} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {skill}
                    </label>
                    <span className={`text-lg font-bold ${getSkillColor(score)}`}>
                      {score}/10
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={score}
                      onChange={(e) => handleSkillChange(skill as keyof typeof skills, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-500 w-16">
                      {getSkillDescription(score)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics Covered</h3>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a topic covered in this lesson..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
              />
              <Button onClick={addTopic} className="px-4 py-2">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topicsCovered.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {topic}
                  <button
                    onClick={() => removeTopic(topic)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Teacher Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record observations, student engagement, areas for improvement..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Homework */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Homework Assignment</h3>
            <div className="space-y-3">
              <textarea
                value={homework.assigned}
                onChange={(e) => setHomework(prev => ({ ...prev, assigned: e.target.value }))}
                placeholder="Assign homework for the student..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={homework.completed}
                    onChange={(e) => setHomework(prev => ({ ...prev, completed: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Previous homework completed</span>
                </label>
              </div>
              {homework.completed && (
                <textarea
                  value={homework.feedback}
                  onChange={(e) => setHomework(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Feedback on completed homework..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Progress Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>Average Score: <span className="font-semibold">
                {(Object.values(skills).reduce((a, b) => a + b, 0) / 6).toFixed(1)}/10
              </span></div>
              <div>Topics Covered: <span className="font-semibold">{topicsCovered.length}</span></div>
              <div>Homework Assigned: <span className="font-semibold">{homework.assigned ? "Yes" : "No"}</span></div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              "Save Progress"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 