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

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
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
  }, [generateUploadUrl]);

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
  }, [handleFileUpload]);

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
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'DOC';
    if (fileType.includes('image')) return 'IMG';
    if (fileType.includes('text')) return 'TXT';
    return 'FILE';
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
      const result = await createLessonFromAILessonPlan({
        aiLessonPlanId: generatedPlan.lessonPlanId,
        scheduledAt: Date.now(),
        teacherId,
        studentId
      });
      
      if (result.success && result.lessonId) {
        // Close the planner
        onClose();
        
        // Show success message with proper lesson ID
        alert(`✅ Lesson scheduled successfully! 
📅 Lesson ID: ${result.lessonId}
🎯 Title: ${generatedPlan.title}
⏱️ Duration: ${generatedPlan.estimatedDuration} minutes

The lesson is now saved in ${studentName}'s profile and ready to be taught!`);
      } else {
        throw new Error(result.error || "Failed to create lesson");
      }
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
          <h2 className="text-2xl font-bold text-gray-900">AI Lesson Planner</h2>
          <p className="text-gray-600 mt-1">Generate a personalized lesson plan for {studentName}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
            studentLevel === 'beginner' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            studentLevel === 'intermediate' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-[#F5F5FF] text-[#6366F1] border border-[#6366F1]'
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
        <div className="space-y-8">
          {/* Lesson Duration */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Lesson Configuration</h3>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Lesson Duration (minutes)
              </label>
              <select
                value={planParams.lessonDuration}
                onChange={(e) => setPlanParams(prev => ({ ...prev, lessonDuration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white font-medium"
              >
                <option value={30}>30 minutes - Quick session</option>
                <option value={45}>45 minutes - Standard lesson</option>
                <option value={60}>60 minutes - Full lesson</option>
                <option value={90}>90 minutes - Extended session</option>
              </select>
            </div>
          </div>

          {/* Focus Skills */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Focus Skills</h3>
                <p className="text-sm text-gray-600">Select 1-3 skills to emphasize in this lesson</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {skillOptions.map((skill) => (
                <label key={skill} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(planParams.focusSkills || []).includes(skill)}
                    onChange={(e) => handleSkillChange(skill, e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-800 capitalize">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specific Goals */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Specific Learning Goals</h3>
                <p className="text-sm text-gray-600">Define what the student should achieve in this lesson</p>
              </div>
            </div>
            <div className="space-y-3">
              {(planParams.specificGoals || [""]).map((goal, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                    placeholder={`Learning goal ${index + 1}...`}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                  />
                  {(planParams.specificGoals || []).length > 1 && (
                    <button
                      onClick={() => removeGoal(index)}
                      className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 focus:ring-4 focus:ring-red-100 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addGoal}
              className="inline-flex items-center px-4 py-2 border-2 border-green-300 text-green-700 rounded-xl hover:bg-green-50 hover:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Goal
            </button>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-[#F5F5FF] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attach Reference Materials</h3>
                <p className="text-sm text-gray-600">Upload files to provide context for the AI lesson planner</p>
              </div>
            </div>
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOver 
                                ? 'border-[#6366F1] bg-[#F5F5FF] scale-105'
            : 'border-gray-300 hover:border-[#6366F1] bg-gray-50 hover:bg-[#F5F5FF]'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-4">
                  <div className="text-5xl">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L16.414 6.5a1 1 0 00-.707-.293H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-800 mb-2">
                      Drop files here or 
                      <label className="text-[#6366F1] hover:text-[#5855EB] cursor-pointer ml-1 underline underline-offset-2">
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
                    <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full inline-block border border-gray-200">
                      PDF • Word • Text • Images (max 10MB each)
                    </p>
                  </div>
                  {isUploading && (
                              <div className="flex items-center justify-center space-x-3 bg-white px-6 py-3 rounded-xl border border-[#6366F1]">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6366F1]"></div>
            <span className="text-sm font-medium text-[#6366F1]">Uploading files...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="grid gap-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#F5F5FF] to-[#E0E7FF] rounded-xl flex items-center justify-center text-2xl">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Additional Context</h3>
                <p className="text-sm text-gray-600">Provide extra details to enhance the lesson plan</p>
              </div>
            </div>
            <textarea
              value={planParams.additionalContext}
              onChange={(e) => setPlanParams(prev => ({ ...prev, additionalContext: e.target.value }))}
              placeholder="Any specific topics, student interests, upcoming exams, or special considerations..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white resize-none"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-red-800 font-medium">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || isUploading || (planParams.focusSkills || []).length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating with Claude...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Lesson Plan
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Generated Plan Display
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
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
                Schedule This Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 