import { v } from "convex/values";
import { query } from "./_generated/server";

// Analyze student progress and generate insights
export const analyzeStudentProgress = query({
  args: { 
    studentId: v.id("students"),
    timeframeWeeks: v.optional(v.number()), // Default to 4 weeks
  },
  returns: v.object({
    studentLevel: v.string(),
    progressData: v.object({
      recentSkillsAverage: v.object({
        reading: v.number(),
        writing: v.number(),
        speaking: v.number(),
        listening: v.number(),
        grammar: v.number(),
        vocabulary: v.number(),
      }),
      weakAreas: v.array(v.string()),
      strongAreas: v.array(v.string()),
      recentTopics: v.array(v.string()),
      totalLessons: v.number(),
    }),
    recommendations: v.object({
      focusSkills: v.array(v.string()),
      suggestedActivities: v.array(v.string()),
      difficultyAdjustment: v.union(v.literal("increase"), v.literal("maintain"), v.literal("decrease")),
      learningStyle: v.optional(v.string()),
    }),
    progressTrend: v.union(v.literal("improving"), v.literal("stable"), v.literal("declining")),
  }),
  handler: async (ctx, args) => {
    const timeframeWeeks = args.timeframeWeeks || 4;
    const timeframeCutoff = Date.now() - (timeframeWeeks * 7 * 24 * 60 * 60 * 1000);
    
    // Get student data
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get recent progress records within timeframe
    const recentProgress = await ctx.db
      .query("progress")
      .withIndex("by_student_and_created", (q) => 
        q.eq("studentId", args.studentId).gte("createdAt", timeframeCutoff)
      )
      .order("desc")
      .collect();

    // Calculate progress data
    const progressData = calculateProgressMetrics(recentProgress);
    
    // Generate recommendations based on analysis
    const recommendations = generateRecommendations(progressData);
    
    // Calculate progress trend
    const progressTrend = calculateProgressTrend(recentProgress);

    return {
      studentLevel: student.level,
      progressData,
      recommendations,
      progressTrend,
    };
  },
});

// Get progress summary for multiple students (teacher dashboard)
export const getTeacherProgressSummary = query({
  args: { 
    teacherId: v.id("users"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    studentId: v.id("students"),
    studentName: v.string(),
    studentLevel: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    overallScore: v.number(),
    weakestSkill: v.string(),
    strongestSkill: v.string(),
    lastLessonDate: v.optional(v.number()),
    progressTrend: v.union(v.literal("improving"), v.literal("stable"), v.literal("declining")),
    needsAttention: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    // Get students for this teacher
    const students = await ctx.db
      .query("students")
      .withIndex("by_teacher_and_active", (q) => 
        q.eq("teacherId", args.teacherId).eq("isActive", true)
      )
      .take(limit);

    const summaries = [];

    for (const student of students) {
      // Get recent progress for each student
      const recentProgress = await ctx.db
        .query("progress")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .order("desc")
        .take(10);

      if (recentProgress.length === 0) {
        summaries.push({
          studentId: student._id,
          studentName: student.name,
          studentLevel: student.level,
          overallScore: 0,
          weakestSkill: "no data",
          strongestSkill: "no data",
          lastLessonDate: undefined,
          progressTrend: "stable" as const,
          needsAttention: true,
        });
        continue;
      }

      const progressMetrics = calculateProgressMetrics(recentProgress);
      const progressTrend = calculateProgressTrend(recentProgress);
      
      // Calculate overall score
      const skills = progressMetrics.recentSkillsAverage;
      const overallScore = Math.round(
        (skills.reading + skills.writing + skills.speaking + 
         skills.listening + skills.grammar + skills.vocabulary) / 6 * 10
      ) / 10;

      // Find weakest and strongest skills
      const skillEntries = Object.entries(skills) as [string, number][];
      const sortedSkills = skillEntries.sort((a, b) => a[1] - b[1]);
      const weakestSkill = sortedSkills[0][0];
      const strongestSkill = sortedSkills[sortedSkills.length - 1][0];

      // Determine if student needs attention
      const needsAttention = overallScore < 6 || progressTrend === "declining" || 
                           (Date.now() - recentProgress[0].createdAt) > (14 * 24 * 60 * 60 * 1000);

      summaries.push({
        studentId: student._id,
        studentName: student.name,
        studentLevel: student.level,
        overallScore,
        weakestSkill,
        strongestSkill,
        lastLessonDate: recentProgress[0].createdAt,
        progressTrend,
        needsAttention,
      });
    }

    // Sort by needs attention first, then by overall score
    return summaries.sort((a, b) => {
      if (a.needsAttention && !b.needsAttention) return -1;
      if (!a.needsAttention && b.needsAttention) return 1;
      return b.overallScore - a.overallScore;
    });
  },
});

// Compare student progress with similar students
export const compareStudentProgress = query({
  args: {
    studentId: v.id("students"),
  },
  returns: v.object({
    studentScore: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
      overall: v.number(),
    }),
    levelAverage: v.object({
      reading: v.number(),
      writing: v.number(),
      speaking: v.number(),
      listening: v.number(),
      grammar: v.number(),
      vocabulary: v.number(),
      overall: v.number(),
    }),
    percentile: v.number(),
    comparisonInsights: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get the student
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get student's recent progress
    const studentProgress = await ctx.db
      .query("progress")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(5);

    if (studentProgress.length === 0) {
      throw new Error("No progress data found for student");
    }

    // Calculate student's average scores
    const studentMetrics = calculateProgressMetrics(studentProgress);
    const studentSkills = studentMetrics.recentSkillsAverage;
    const studentOverall = (
      studentSkills.reading + studentSkills.writing + studentSkills.speaking +
      studentSkills.listening + studentSkills.grammar + studentSkills.vocabulary
    ) / 6;

    // Get all students of the same level
    const similarStudents = await ctx.db
      .query("students")
      .withIndex("by_level", (q) => q.eq("level", student.level))
      .collect();

    // Calculate level averages
    const levelScores = [];

    for (const similarStudent of similarStudents) {
      if (similarStudent._id === args.studentId) continue;

      const progress = await ctx.db
        .query("progress")
        .withIndex("by_student", (q) => q.eq("studentId", similarStudent._id))
        .order("desc")
        .take(5);

      if (progress.length > 0) {
        const metrics = calculateProgressMetrics(progress);
        levelScores.push(metrics.recentSkillsAverage);
      }
    }

    // Calculate level averages
    const levelAverage = levelScores.length > 0 ? {
      reading: levelScores.reduce((sum, scores) => sum + scores.reading, 0) / levelScores.length,
      writing: levelScores.reduce((sum, scores) => sum + scores.writing, 0) / levelScores.length,
      speaking: levelScores.reduce((sum, scores) => sum + scores.speaking, 0) / levelScores.length,
      listening: levelScores.reduce((sum, scores) => sum + scores.listening, 0) / levelScores.length,
      grammar: levelScores.reduce((sum, scores) => sum + scores.grammar, 0) / levelScores.length,
      vocabulary: levelScores.reduce((sum, scores) => sum + scores.vocabulary, 0) / levelScores.length,
      overall: 0,
    } : {
      reading: 5, writing: 5, speaking: 5, listening: 5, grammar: 5, vocabulary: 5, overall: 5,
    };

    levelAverage.overall = (
      levelAverage.reading + levelAverage.writing + levelAverage.speaking +
      levelAverage.listening + levelAverage.grammar + levelAverage.vocabulary
    ) / 6;

    // Calculate percentile
    const overallScores = levelScores.map(scores => 
      (scores.reading + scores.writing + scores.speaking + 
       scores.listening + scores.grammar + scores.vocabulary) / 6
    );
    overallScores.push(studentOverall);
    overallScores.sort((a, b) => a - b);
    const percentile = Math.round((overallScores.indexOf(studentOverall) / (overallScores.length - 1)) * 100);

    // Generate comparison insights
    const comparisonInsights = [];
    
    if (studentOverall > levelAverage.overall + 1) {
      comparisonInsights.push("Performing above average for their level");
    } else if (studentOverall < levelAverage.overall - 1) {
      comparisonInsights.push("Performing below average for their level");
    } else {
      comparisonInsights.push("Performing at level average");
    }

    // Skill-specific insights
    const skillComparisons = Object.entries(studentSkills) as [string, number][];
    for (const [skill, score] of skillComparisons) {
      const levelScore = levelAverage[skill as keyof typeof levelAverage] as number;
      if (score > levelScore + 1) {
        comparisonInsights.push(`Strong in ${skill} compared to peers`);
      } else if (score < levelScore - 1) {
        comparisonInsights.push(`Needs improvement in ${skill} compared to peers`);
      }
    }

    if (percentile >= 75) {
      comparisonInsights.push("In the top 25% of students at this level");
    } else if (percentile <= 25) {
      comparisonInsights.push("In the bottom 25% of students at this level");
    }

    return {
      studentScore: {
        ...studentSkills,
        overall: studentOverall,
      },
      levelAverage,
      percentile,
      comparisonInsights,
    };
  },
});

// Helper function to calculate progress metrics from progress records
function calculateProgressMetrics(progressRecords: Array<{
  skills: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
  };
  topicsCovered: string[];
}>) {
  if (progressRecords.length === 0) {
    return {
      recentSkillsAverage: {
        reading: 5,
        writing: 5,
        speaking: 5,
        listening: 5,
        grammar: 5,
        vocabulary: 5,
      },
      weakAreas: ["all skills need development"],
      strongAreas: ["beginner level appropriate"],
      recentTopics: [],
      totalLessons: 0,
    };
  }

  // Calculate averages
  const skillSums = progressRecords.reduce(
    (acc, progress) => ({
      reading: acc.reading + progress.skills.reading,
      writing: acc.writing + progress.skills.writing,
      speaking: acc.speaking + progress.skills.speaking,
      listening: acc.listening + progress.skills.listening,
      grammar: acc.grammar + progress.skills.grammar,
      vocabulary: acc.vocabulary + progress.skills.vocabulary,
    }),
    { reading: 0, writing: 0, speaking: 0, listening: 0, grammar: 0, vocabulary: 0 }
  );

  const count = progressRecords.length;
  const averages = {
    reading: Math.round((skillSums.reading / count) * 10) / 10,
    writing: Math.round((skillSums.writing / count) * 10) / 10,
    speaking: Math.round((skillSums.speaking / count) * 10) / 10,
    listening: Math.round((skillSums.listening / count) * 10) / 10,
    grammar: Math.round((skillSums.grammar / count) * 10) / 10,
    vocabulary: Math.round((skillSums.vocabulary / count) * 10) / 10,
  };

  // Identify weak and strong areas
  const skillEntries = Object.entries(averages) as [string, number][];
  const sortedSkills = skillEntries.sort((a, b) => a[1] - b[1]);
  
  const weakAreas = sortedSkills.slice(0, 2).map(([skill]) => skill);
  const strongAreas = sortedSkills.slice(-2).map(([skill]) => skill);

  // Collect recent topics
  const recentTopics = Array.from(
    new Set(
      progressRecords
        .flatMap(progress => progress.topicsCovered)
        .filter(Boolean)
    )
  );

  return {
    recentSkillsAverage: averages,
    weakAreas,
    strongAreas,
    recentTopics,
    totalLessons: count,
  };
}

// Helper function to generate recommendations based on progress
function generateRecommendations(progressData: {
  recentSkillsAverage: Record<string, number>;
  weakAreas: string[];
  strongAreas: string[];
}) {
  const { recentSkillsAverage, weakAreas, strongAreas } = progressData;
  const focusSkills = [];
  const suggestedActivities = [];
  let difficultyAdjustment: "increase" | "maintain" | "decrease" = "maintain";

  // Determine focus skills based on weak areas
  focusSkills.push(...weakAreas.slice(0, 2));

  // Calculate overall average
  const overallAverage = Object.values(recentSkillsAverage).reduce((sum: number, score: number) => sum + score, 0) / 6;

  // Suggest difficulty adjustment
  if (overallAverage >= 8) {
    difficultyAdjustment = "increase";
  } else if (overallAverage <= 5) {
    difficultyAdjustment = "decrease";
  }

  // Suggest activities based on weak areas
  if (weakAreas.includes("speaking")) {
    suggestedActivities.push("Role-play conversations", "Pronunciation drills", "Speaking fluency exercises");
  }
  if (weakAreas.includes("listening")) {
    suggestedActivities.push("Audio comprehension tasks", "Dictation exercises", "Listening for details");
  }
  if (weakAreas.includes("reading")) {
    suggestedActivities.push("Reading comprehension passages", "Vocabulary building", "Text analysis");
  }
  if (weakAreas.includes("writing")) {
    suggestedActivities.push("Structured writing tasks", "Grammar exercises", "Creative writing");
  }
  if (weakAreas.includes("grammar")) {
    suggestedActivities.push("Grammar drills", "Sentence construction", "Error correction");
  }
  if (weakAreas.includes("vocabulary")) {
    suggestedActivities.push("Word association games", "Vocabulary expansion", "Context clues");
  }

  return {
    focusSkills,
    suggestedActivities: suggestedActivities.slice(0, 4), // Limit to 4 suggestions
    difficultyAdjustment,
    learningStyle: inferLearningStyle(strongAreas),
  };
}

// Helper function to calculate progress trend
function calculateProgressTrend(progressRecords: Array<{
  skills: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
  };
}>): "improving" | "stable" | "declining" {
  if (progressRecords.length < 3) {
    return "stable";
  }

  // Calculate overall scores for recent sessions
  const recentScores = progressRecords.slice(0, 3).map(progress => {
    const skills = progress.skills;
    return (skills.reading + skills.writing + skills.speaking + 
            skills.listening + skills.grammar + skills.vocabulary) / 6;
  });

  // Calculate trend
  const firstScore = recentScores[2]; // Oldest of the recent 3
  const lastScore = recentScores[0];  // Most recent
  const difference = lastScore - firstScore;

  if (difference > 0.5) {
    return "improving";
  } else if (difference < -0.5) {
    return "declining";
  } else {
    return "stable";
  }
}

// Helper function to infer learning style from strong areas
function inferLearningStyle(strongAreas: string[]): string | undefined {
  if (strongAreas.includes("reading") && strongAreas.includes("writing")) {
    return "visual/text-based";
  } else if (strongAreas.includes("speaking") && strongAreas.includes("listening")) {
    return "auditory/verbal";
  } else if (strongAreas.includes("vocabulary") && strongAreas.includes("grammar")) {
    return "analytical/structured";
  }
  return undefined;
} 