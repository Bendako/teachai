"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface AILessonPlannerProps {
  studentId: Id<"students">;
  studentName: string;
  studentLevel: "beginner" | "intermediate" | "advanced";
  teacherId: Id<"users">;
  onClose: () => void;
  onPlanCreated?: (planId: Id<"ai_lesson_plans">) => void;
}

interface GeneratedPlanData {
  lessonPlanId: Id<"ai_lesson_plans">;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number;
  objectives: string[];
  activities: Array<{
    name: string;
    description: string;
    duration: number;
    skillsTargeted: string[];
    materials: string[];
  }>;
  homework?: {
    description: string;
    estimatedTime: number;
    resources: string[];
  };
}

interface UploadedFile {
  id: Id<"_storage">;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export function AILessonPlanner({ 
  studentId, 
  studentName, 
  studentLevel, 
  teacherId, 
  onClose,
  onPlanCreated 
}: AILessonPlannerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [planParams, setPlanParams] = useState({
    lessonDuration: 60,
    focusSkills: ["speaking", "vocabulary"] as string[],
    specificGoals: [""] as string[],
    additionalContext: ""
  });

  const generateComprehensiveLessonPlan = useAction(api.lessonGeneration.generateComprehensiveLessonPlan);
  const createLessonFromAILessonPlan = useAction(api.lessonGeneration.createLessonFromAILessonPlan);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const skillOptions = [
    "reading", "writing", "speaking", "listening", "grammar", "vocabulary"
  ];

  // Fix hydration issues by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setPlanParams(prev => ({
        ...prev,
        focusSkills: [...(prev.focusSkills || []), skill]
      }));
    } else {
      setPlanParams(prev => ({
        ...prev,
        focusSkills: (prev.focusSkills || []).filter(s => s !== skill)
      }));
    }
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...(planParams.specificGoals || [""])];
    newGoals[index] = value;
    setPlanParams(prev => ({ ...prev, specificGoals: newGoals }));
  };

  const addGoal = () => {
    setPlanParams(prev => ({
      ...prev,
      specificGoals: [...(prev.specificGoals || []), ""]
    }));
  };

  const removeGoal = (index: number) => {
    setPlanParams(prev => ({
      ...prev,
      specificGoals: (prev.specificGoals || []).filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    const validFiles = fileArray.filter(file => {
      if (file.size > maxFileSize) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" is not a supported format. Please use PDF, Word, text, or image files.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const uploadUrl = await generateUploadUrl();
        
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await response.json();
        
        return {
          id: storageId,
          name: file.name,
          size: file.size,
          type: file.type,
        };
      });

      const uploadedFileData = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploadedFileData]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: Id<"_storage">) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text')) return '📃';
    return '📎';
  };

  const handleGeneratePlan = async () => {
    const focusSkills = planParams.focusSkills || [];
    if (focusSkills.length === 0) {
      setError("Please select at least one focus skill");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedPlan(null);

    try {
      const result = await generateComprehensiveLessonPlan({
        teacherId,
        studentId,
        focusSkills: focusSkills,
        lessonDuration: planParams.lessonDuration,
        specificGoals: (planParams.specificGoals || []).filter(goal => goal.trim() !== ""),
        additionalContext: planParams.additionalContext || undefined,
        attachedFiles: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.id) : undefined
      });

      if (result.success && result.lessonPlan && result.lessonPlanId) {
        const planData: GeneratedPlanData = {
          lessonPlanId: result.lessonPlanId,
          title: result.lessonPlan.title,
          description: result.lessonPlan.description,
          difficulty: result.lessonPlan.difficulty,
          estimatedDuration: result.lessonPlan.estimatedDuration,
          objectives: result.lessonPlan.objectives,
          activities: result.lessonPlan.activities,
          homework: result.lessonPlan.homework,
        };
        setGeneratedPlan(planData);
        onPlanCreated?.(result.lessonPlanId);
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
      const lessonId = await createLessonFromAILessonPlan({
        aiLessonPlanId: generatedPlan.lessonPlanId,
        scheduledAt: Date.now(),
        teacherId,
        studentId
      });
      
      // Close the planner
      onClose();
      
      // You could also navigate to the created lesson or show a success message
      alert(`Lesson scheduled successfully! Lesson ID: ${lessonId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lesson");
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
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
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 AI Lesson Planner</h2>
          <p className="text-gray-600 mt-1">Generate a personalized lesson plan for {studentName}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
            studentLevel === 'beginner' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            studentLevel === 'intermediate' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-purple-50 text-purple-700 border border-purple-200'
          }`}>
            {studentLevel.charAt(0).toUpperCase() + studentLevel.slice(1)} Level
          </span>
        </div>
        <Button variant="outline" onClick={onClose} className="font-medium">
          ✕ Close
        </Button>
      </div>

      {!generatedPlan ? (
        // Planning Form
        <div className="space-y-6">
          {/* Lesson Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Duration (minutes)
            </label>
            <select
              value={planParams.lessonDuration}
              onChange={(e) => setPlanParams(prev => ({ ...prev, lessonDuration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          {/* Focus Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Focus Skills (select 1-3)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {skillOptions.map((skill) => (
                <label key={skill} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(planParams.focusSkills || []).includes(skill)}
                    onChange={(e) => handleSkillChange(skill, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specific Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Learning Goals
            </label>
            <div className="space-y-2">
              {(planParams.specificGoals || [""]).map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                    placeholder={`Learning goal ${index + 1}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {(planParams.specificGoals || []).length > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => removeGoal(index)}
                      className="px-2"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={addGoal}
              className="mt-2 text-sm"
            >
              + Add Goal
            </Button>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📎 Attach Reference Materials (optional)
            </label>
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-3">
                  <div className="text-4xl">📁</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop files here or 
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer ml-1">
                        browse
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, Word, Text, or Image files (max 10MB each)
                    </p>
                  </div>
                  {isUploading && (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-600">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="grid gap-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getFileIcon(file.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context (optional)
            </label>
            <textarea
              value={planParams.additionalContext}
              onChange={(e) => setPlanParams(prev => ({ ...prev, additionalContext: e.target.value }))}
              placeholder="Any specific topics, student interests, upcoming exams, or special considerations..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePlan}
              disabled={isGenerating || isUploading || (planParams.focusSkills || []).length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating with Claude...
                </>
              ) : (
                <>🤖 Generate AI Lesson Plan</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        // Generated Plan Display
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-green-600 text-xl mr-2">✅</span>
              <div>
                <h3 className="font-semibold text-green-900">Lesson Plan Generated!</h3>
                <p className="text-green-700 text-sm">Claude has created a personalized lesson plan based on {studentName}&apos;s progress</p>
              </div>
            </div>
          </div>

          {/* Generated Plan Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{generatedPlan.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Duration & Level</h4>
                <p className="text-sm text-gray-600">{generatedPlan.estimatedDuration} minutes • {generatedPlan.difficulty}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Focus Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {(planParams.focusSkills || []).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Show attached files if any */}
            {uploadedFiles.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Attached Reference Materials</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <span key={file.id} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {getFileIcon(file.type)} {file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{generatedPlan.description}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Learning Objectives</h4>
              <ul className="list-disc list-inside space-y-1">
                {(generatedPlan.objectives || []).map((objective: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">{objective}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-3">Activities ({(generatedPlan.activities || []).length})</h4>
              <div className="space-y-3">
                {(generatedPlan.activities || []).map((activity, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{activity.name}</h5>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {activity.duration} min
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="text-xs text-blue-600">
                        Skills: {(activity.skillsTargeted || []).join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {generatedPlan.homework && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Homework Assignment</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">{generatedPlan.homework.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Estimated time: {generatedPlan.homework.estimatedTime} minutes</p>
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
                📅 Schedule This Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 