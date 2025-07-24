"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface EnhancedAIPlannerProps {
  studentId: Id<"students">;
  studentName: string;
  teacherId: Id<"users">;
  onClose: () => void;
  onLessonCreated?: (lessonId: Id<"lessons">) => void;
}

interface PreviousLesson {
  lessonId: Id<"lessons">;
  title: string;
  scheduledAt: number;
  topicsCovered: string[];
  skillsAssessed: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
  };
  notes: string;
  performance: {
    averageScore: number;
    areasForImprovement: string[];
    strengths: string[];
  };
}

interface GeneratedLessonPlan {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number;
  objectives: string[];
  activities: Array<{
    name: string;
    description: string;
    duration: number;
    materials: string[];
    skillsTargeted: string[];
  }>;
  materials: string[];
  homework?: {
    description: string;
    estimatedTime: number;
    resources: string[];
  };
  assessmentCriteria: string[];
  adaptationNotes: string;
  previousLessonContext: {
    topicsCovered: string[];
    skillsAssessed: {
      reading: number;
      writing: number;
      speaking: number;
      listening: number;
      grammar: number;
      vocabulary: number;
    };
    areasForImprovement: string[];
    strengths: string[];
    notes: string;
  };
}

export function EnhancedAIPlanner({ 
  studentId, 
  studentName, 
  teacherId, 
  onClose,
  onLessonCreated 
}: EnhancedAIPlannerProps) {
  const [selectedPreviousLesson, setSelectedPreviousLesson] = useState<Id<"lessons"> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [planParams, setPlanParams] = useState({
    lessonDuration: 60,
    focusSkills: [] as string[],
    additionalContext: ""
  });

  const generateLessonFromPrevious = useAction(api.enhancedLessonGeneration.generateLessonFromPreviousContext);
  const createLesson = useMutation(api.lessons.createLesson);

  const skillOptions = [
    "reading", "writing", "speaking", "listening", "grammar", "vocabulary"
  ];

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setPlanParams(prev => ({
        ...prev,
        focusSkills: [...prev.focusSkills, skill]
      }));
    } else {
      setPlanParams(prev => ({
        ...prev,
        focusSkills: prev.focusSkills.filter(s => s !== skill)
      }));
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedPreviousLesson) {
      setError("Please select a previous lesson to build upon");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedPlan(null);

    try {
      const result = await generateLessonFromPrevious({
        teacherId,
        studentId,
        previousLessonId: selectedPreviousLesson,
        focusSkills: planParams.focusSkills.length > 0 ? planParams.focusSkills : undefined,
        lessonDuration: planParams.lessonDuration,
        additionalContext: planParams.additionalContext || undefined,
      });

      if (result.success && result.lessonPlan) {
        setGeneratedPlan(result.lessonPlan);
      } else {
        throw new Error(result.error || "Failed to generate lesson plan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate lesson plan");
      console.error("Error generating lesson plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!generatedPlan) return;

    try {
      const lessonId = await createLesson({
        teacherId,
        studentId,
        title: generatedPlan.title,
        description: generatedPlan.description,
        scheduledAt: Date.now(),
        duration: generatedPlan.estimatedDuration,
        lessonPlan: {
          objectives: generatedPlan.objectives,
          activities: generatedPlan.activities.map((activity) => 
            `${activity.name}: ${activity.description} (${activity.duration} min)`
          ),
          materials: generatedPlan.materials,
          homework: generatedPlan.homework?.description,
        },
      });

      onLessonCreated?.(lessonId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lesson");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced AI Lesson Planner</h2>
          <p className="text-gray-600 mt-1">
            Create a lesson based on {studentName}&apos;s previous lessons
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-xl border-gray-200 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
            </svg>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {!generatedPlan ? (
        // Lesson Generation Interface
        <div className="space-y-6">
          {/* Previous Lesson Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Select Previous Lesson to Build Upon
            </h3>
            <PreviousLessonSelector
              studentId={studentId}
              selectedLesson={selectedPreviousLesson}
              onSelectLesson={setSelectedPreviousLesson}
            />
          </div>

          {/* Lesson Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Lesson Parameters</h3>
            
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Duration (minutes)
              </label>
              <input
                type="number"
                value={planParams.lessonDuration}
                onChange={(e) => setPlanParams(prev => ({ 
                  ...prev, 
                  lessonDuration: parseInt(e.target.value) || 60 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="30"
                max="120"
                step="15"
              />
            </div>

            {/* Focus Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Skills (optional - AI will choose based on previous lesson if not selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {skillOptions.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={planParams.focusSkills.includes(skill)}
                      onChange={(e) => handleSkillChange(skill, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (optional)
              </label>
              <textarea
                value={planParams.additionalContext}
                onChange={(e) => setPlanParams(prev => ({ 
                  ...prev, 
                  additionalContext: e.target.value 
                }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional context or specific requirements for this lesson..."
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePlan}
            disabled={isGenerating || !selectedPreviousLesson}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Enhanced Lesson Plan...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Enhanced Lesson Plan
              </div>
            )}
          </Button>
        </div>
      ) : (
        // Generated Plan Display
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900">Enhanced Lesson Plan Generated!</h3>
                <p className="text-green-700 text-sm">
                  Built upon previous lesson with context-aware improvements
                </p>
              </div>
            </div>
          </div>

          {/* Previous Lesson Context */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Previous Lesson Context</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800">Topics Covered:</p>
                <p className="text-blue-700">{generatedPlan.previousLessonContext.topicsCovered.join(", ")}</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Areas for Improvement:</p>
                <p className="text-blue-700">{generatedPlan.previousLessonContext.areasForImprovement.join(", ")}</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Strengths:</p>
                <p className="text-blue-700">{generatedPlan.previousLessonContext.strengths.join(", ")}</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Teacher Notes:</p>
                <p className="text-blue-700">{generatedPlan.previousLessonContext.notes}</p>
              </div>
            </div>
          </div>

          {/* Generated Plan Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4">{generatedPlan.title}</h4>
            <p className="text-gray-600 mb-4">{generatedPlan.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Objectives</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {generatedPlan.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Activities</h5>
                <div className="space-y-3">
                  {generatedPlan.activities.map((activity, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm">{activity.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.duration} min • {activity.skillsTargeted.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {generatedPlan.homework && (
              <div className="mt-4">
                <h5 className="font-semibold text-gray-900 mb-2">Homework</h5>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{generatedPlan.homework.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated time: {generatedPlan.homework.estimatedTime} minutes
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setGeneratedPlan(null)}
            >
              ← Generate New Plan
            </Button>
            <div className="space-x-3">
              <Button variant="outline" onClick={onClose}>
                Save Plan Only
              </Button>
              <Button
                onClick={handleCreateLesson}
                className="bg-green-600 hover:bg-green-700"
              >
                Create This Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Previous Lesson Selector Component
function PreviousLessonSelector({ 
  studentId, 
  selectedLesson, 
  onSelectLesson 
}: { 
  studentId: Id<"students">; 
  selectedLesson: Id<"lessons"> | null; 
  onSelectLesson: (lessonId: Id<"lessons">) => void; 
}) {
  const [previousLessons, setPreviousLessons] = useState<PreviousLesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const getPreviousLessons = useAction(api.enhancedLessonGeneration.getPreviousLessonsForContext);

  useEffect(() => {
    const loadPreviousLessons = async () => {
      setIsLoading(true);
      try {
        const result = await getPreviousLessons({
          studentId,
          limit: 5,
        });
        
        if (result.success && result.lessons) {
          setPreviousLessons(result.lessons);
        }
      } catch (error) {
        console.error("Failed to load previous lessons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviousLessons();
  }, [studentId, getPreviousLessons]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-blue-600">Loading previous lessons...</span>
      </div>
    );
  }

  if (previousLessons.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>No previous lessons found. Create a lesson first to use this feature.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {previousLessons.map((lesson) => (
        <div
          key={lesson.lessonId}
          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
            selectedLesson === lesson.lessonId
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
          onClick={() => onSelectLesson(lesson.lessonId)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
              <p className="text-sm text-gray-600">
                {new Date(lesson.scheduledAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Topics: {lesson.topicsCovered.join(", ")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {lesson.performance.averageScore.toFixed(1)}/10
              </div>
              <div className="text-xs text-gray-500">
                {lesson.performance.overallPerformance}
              </div>
            </div>
          </div>
          
          {selectedLesson === lesson.lessonId && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-blue-800">Strengths:</span>
                  <p className="text-blue-700">{lesson.performance.strengths.join(", ")}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Needs Work:</span>
                  <p className="text-blue-700">{lesson.performance.areasForImprovement.join(", ")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 