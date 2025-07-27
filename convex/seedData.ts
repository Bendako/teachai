import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Seed the database with sample data for demonstration
export const seedSampleData = mutation({
  args: { teacherId: v.id("users") },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    data: v.object({
      studentsCreated: v.number(),
      lessonsCreated: v.number(),
      progressRecordsCreated: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    try {
      let studentsCreated = 0;
      let lessonsCreated = 0;
      let progressRecordsCreated = 0;

      // Sample students data
      const sampleStudents = [
        {
          name: "Emma Johnson",
          email: "emma.johnson@example.com",
          level: "beginner" as const,
          goals: ["Improve basic conversation skills", "Learn essential vocabulary"],
          parentInfo: {
            name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
            phone: "+1-555-0123",
            relationship: "Mother",
          },
        },
        {
          name: "Carlos Rodriguez",
          email: "carlos.rodriguez@example.com",
          level: "intermediate" as const,
          goals: ["Master grammar concepts", "Improve writing skills"],
          parentInfo: {
            name: "Maria Rodriguez",
            email: "maria.rodriguez@example.com",
            phone: "+1-555-0124",
            relationship: "Mother",
          },
        },
        {
          name: "Aisha Patel",
          email: "aisha.patel@example.com",
          level: "advanced" as const,
          goals: ["Perfect pronunciation", "Academic writing"],
          parentInfo: {
            name: "Raj Patel",
            email: "raj.patel@example.com",
            phone: "+1-555-0125",
            relationship: "Father",
          },
        },
      ];

      // Create sample students
      const studentIds = [];
      for (const studentData of sampleStudents) {
        const studentId = await ctx.db.insert("students", {
          teacherId: args.teacherId,
          name: studentData.name,
          email: studentData.email,
          level: studentData.level,
          goals: studentData.goals,
          parentInfo: studentData.parentInfo,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        studentIds.push(studentId);
        studentsCreated++;
      }

      // Sample lessons data
      const sampleLessons = [
        {
          title: "Basic Greetings and Introductions",
          description: "Learn essential greetings and self-introduction phrases",
          duration: 45,
          status: "completed" as const,
          scheduledAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
        },
        {
          title: "Present Tense Practice",
          description: "Practice using present tense in everyday conversations",
          duration: 60,
          status: "completed" as const,
          scheduledAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          title: "Vocabulary Building - Food and Restaurants",
          description: "Expand vocabulary related to food and dining",
          duration: 50,
          status: "completed" as const,
          scheduledAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          title: "Grammar Review - Past Tense",
          description: "Review and practice past tense forms",
          duration: 60,
          status: "planned" as const,
          scheduledAt: Date.now() + (2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
      ];

      // Create sample lessons for each student
      const lessonIds = [];
      for (const studentId of studentIds) {
        for (const lessonData of sampleLessons) {
          const lessonId = await ctx.db.insert("lessons", {
            teacherId: args.teacherId,
            studentId: studentId,
            title: lessonData.title,
            description: lessonData.description,
            scheduledAt: lessonData.scheduledAt,
            duration: lessonData.duration,
            status: lessonData.status,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          lessonIds.push({ lessonId, studentId, status: lessonData.status });
          lessonsCreated++;
        }
      }

      // Sample progress data for completed lessons
      const sampleProgressData = [
        {
          skills: { reading: 6, writing: 5, speaking: 7, listening: 6, grammar: 4, vocabulary: 5 },
          topicsCovered: ["Greetings", "Self-introduction", "Basic questions"],
          notes: "Emma showed good enthusiasm and was able to learn basic greetings quickly. Needs more practice with pronunciation.",
          homework: { assigned: "Practice greetings with family members", completed: true, feedback: "Good effort, pronunciation improving" },
        },
        {
          skills: { reading: 7, writing: 6, speaking: 8, listening: 7, grammar: 5, vocabulary: 6 },
          topicsCovered: ["Present tense", "Daily routines", "Simple sentences"],
          notes: "Carlos has a good foundation. Struggles with irregular verbs but shows improvement.",
          homework: { assigned: "Write 5 sentences about daily routine", completed: false },
        },
        {
          skills: { reading: 8, writing: 7, speaking: 9, listening: 8, grammar: 6, vocabulary: 7 },
          topicsCovered: ["Food vocabulary", "Restaurant phrases", "Ordering food"],
          notes: "Aisha excelled in this lesson. Strong vocabulary retention and good pronunciation.",
          homework: { assigned: "Create a menu and practice ordering", completed: true, feedback: "Excellent work, very creative menu" },
        },
      ];

      // Create progress records for completed lessons
      for (let i = 0; i < lessonIds.length; i++) {
        const { lessonId, studentId, status } = lessonIds[i];
        if (status === "completed") {
          const progressData = sampleProgressData[i % sampleProgressData.length];
          await ctx.db.insert("progress", {
            lessonId: lessonId,
            studentId: studentId,
            teacherId: args.teacherId,
            skills: progressData.skills,
            topicsCovered: progressData.topicsCovered,
            notes: progressData.notes,
            homework: progressData.homework,
            createdAt: Date.now(),
          });
          progressRecordsCreated++;
        }
      }

      return {
        success: true,
        message: "Sample data created successfully! You now have 3 students with lesson history and progress records.",
        data: {
          studentsCreated,
          lessonsCreated,
          progressRecordsCreated,
        },
      };

    } catch (error) {
      console.error("Failed to seed sample data:", error);
      return {
        success: false,
        message: `Failed to create sample data: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: {
          studentsCreated: 0,
          lessonsCreated: 0,
          progressRecordsCreated: 0,
        },
      };
    }
  },
}); 