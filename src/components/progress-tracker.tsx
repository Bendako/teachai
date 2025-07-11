"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface ProgressTrackerProps {
  lessonId: Id<"lessons">;
  studentId: Id<"students">;
  teacherId: Id<"users">;
  onComplete?: () => void;
}

type Skills = {
  reading: number;
  writing: number;
  speaking: number;
  listening: number;
  grammar: number;
  vocabulary: number;
};

export function ProgressTracker({ lessonId, studentId, teacherId, onComplete }: ProgressTrackerProps) {
  const existingProgress = useQuery(api.progress.getProgressByLesson, { lessonId });
  const createProgress = useMutation(api.progress.createProgress);
  const updateProgress = useMutation(api.progress.updateProgress);
  const updateLessonStatus = useMutation(api.lessons.updateLessonStatus);

  const [skills, setSkills] = useState<Skills>({
    reading: 5,
    writing: 5,
    speaking: 5,
    listening: 5,
    grammar: 5,
    vocabulary: 5,
  });

  const [topicsCovered, setTopicsCovered] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [homework, setHomework] = useState({
    assigned: "",
    completed: false,
    feedback: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing progress data
  useEffect(() => {
    if (existingProgress) {
      setSkills(existingProgress.skills);
      setTopicsCovered(existingProgress.topicsCovered);
      setNotes(existingProgress.notes);
      if (existingProgress.homework) {
        setHomework({
          assigned: existingProgress.homework.assigned,
          completed: existingProgress.homework.completed,
          feedback: existingProgress.homework.feedback || "",
        });
      }
    }
  }, [existingProgress]);

  // Mark as having changes when data is modified
  useEffect(() => {
    setHasChanges(true);
  }, [skills, topicsCovered, notes, homework]);

  const handleSkillChange = (skill: keyof Skills, value: number) => {
    setSkills(prev => ({ ...prev, [skill]: value }));
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
      if (existingProgress) {
        // Update existing progress
        await updateProgress({
          progressId: existingProgress._id,
          skills,
          topicsCovered,
          notes,
          homework: homework.assigned ? homework : undefined,
        });
      } else {
        // Create new progress record
        await createProgress({
          lessonId,
          studentId,
          teacherId,
          skills,
          topicsCovered,
          notes,
          homework: homework.assigned ? homework : undefined,
        });
      }
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    await handleSave();
    // Mark the lesson as completed
    await updateLessonStatus({
      lessonId,
      status: "completed",
    });
    onComplete?.();
  };

  if (existingProgress === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading progress...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Lesson Progress</h2>
        <div className="flex space-x-2">
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
              className="text-blue-600"
            >
              {isSaving ? "Saving..." : "Save Progress"}
            </Button>
          )}
          <Button
            onClick={handleComplete}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Lesson
          </Button>
        </div>
      </div>

      {/* Skills Assessment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Skill Assessment (1-10)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(skills).map(([skill, value]) => (
            <SkillSlider
              key={skill}
              skill={skill as keyof Skills}
              value={value}
              onChange={(newValue) => handleSkillChange(skill as keyof Skills, newValue)}
            />
          ))}
        </div>
      </div>

      {/* Topics Covered */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Topics Covered</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {topicsCovered.map((topic) => (
            <TopicTag key={topic} topic={topic} onRemove={() => removeTopic(topic)} />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTopic()}
            placeholder="Add a topic covered in this lesson..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={addTopic} disabled={!newTopic.trim()}>
            Add Topic
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Lesson Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record observations, areas for improvement, student behavior, breakthroughs, etc..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Homework Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Homework Assignment</h3>
        <div className="space-y-3">
          <textarea
            value={homework.assigned}
            onChange={(e) => setHomework(prev => ({ ...prev, assigned: e.target.value }))}
            placeholder="Assign homework or practice exercises..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="homework-completed"
              checked={homework.completed}
              onChange={(e) => setHomework(prev => ({ ...prev, completed: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="homework-completed" className="text-sm text-gray-700">
              Homework completed (for review of previous assignment)
            </label>
          </div>
          {homework.completed && (
            <textarea
              value={homework.feedback}
              onChange={(e) => setHomework(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Feedback on completed homework..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {hasChanges && (
        <div className="text-sm text-orange-600 flex items-center">
          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
          Unsaved changes
        </div>
      )}
    </div>
  );
}

function SkillSlider({ skill, value, onChange }: { 
  skill: keyof Skills; 
  value: number; 
  onChange: (value: number) => void; 
}) {
  const skillLabels = {
    reading: "📖 Reading",
    writing: "✍️ Writing",
    speaking: "🗣️ Speaking",
    listening: "👂 Listening",
    grammar: "📝 Grammar",
    vocabulary: "📚 Vocabulary",
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-600";
    if (score <= 5) return "text-yellow-600";
    if (score <= 7) return "text-blue-600";
    return "text-green-600";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 3) return "Needs Improvement";
    if (score <= 5) return "Developing";
    if (score <= 7) return "Good";
    return "Excellent";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {skillLabels[skill]}
        </label>
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-bold ${getScoreColor(value)}`}>
            {value}
          </span>
          <span className={`text-xs ${getScoreColor(value)}`}>
            {getScoreLabel(value)}
          </span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

function TopicTag({ topic, onRemove }: { topic: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
      {topic}
      <button
        onClick={onRemove}
        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
      >
        ×
      </button>
    </span>
  );
} 