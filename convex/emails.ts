"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Resend } from "resend";

// Lazy initialization of Resend to prevent deployment errors
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('place')) {
    throw new Error("RESEND_API_KEY is not configured or is placeholder");
  }
  return new Resend(apiKey);
}

// Send lesson summary email to parent
export const sendLessonSummaryEmail = action({
  args: {
    studentId: v.id("students"),
    lessonId: v.id("lessons"),
    progressId: v.id("progress"),
    teacherId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Get student data
      const student = await ctx.runQuery(api.students.getStudent, { 
        studentId: args.studentId 
      });
      
      if (!student) {
        return { success: false, error: "Student not found" };
      }

      // Check if student has parent info and email
      if (!student.parentInfo?.email) {
        return { success: false, error: "No parent email on file" };
      }

      // Get lesson data
      const lesson = await ctx.runQuery(api.lessons.getLesson, { 
        lessonId: args.lessonId 
      });
      
      if (!lesson) {
        return { success: false, error: "Lesson not found" };
      }

      // Get progress data
      const progress = await ctx.runQuery(api.progress.getProgressByLesson, { 
        lessonId: args.lessonId 
      });
      
      if (!progress) {
        return { success: false, error: "Progress data not found" };
      }

      // Get teacher data
      const teacher = await ctx.runQuery(api.users.getUserById, { 
        userId: args.teacherId 
      });
      
      if (!teacher) {
        return { success: false, error: "Teacher not found" };
      }

      // Generate email content
      const emailHtml = generateLessonSummaryHTML({
        student,
        lesson,
        progress,
        teacher,
      });

      const emailSubject = `${student.name}'s English Lesson Summary - ${new Date(lesson.scheduledAt).toLocaleDateString()}`;

      // Send email using Resend
      const resend = getResendClient();
      const emailResult = await resend.emails.send({
        from: `${teacher.name} <lessons@teachai-app.com>`,
        to: [student.parentInfo.email],
        subject: emailSubject,
        html: emailHtml,
        replyTo: teacher.email || "noreply@teachai-app.com",
      });

      if (emailResult.error) {
        return { 
          success: false, 
          error: `Email service error: ${emailResult.error.message}` 
        };
      }

      return { 
        success: true, 
        messageId: emailResult.data?.id 
      };

    } catch (error) {
      console.error("Email sending error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

// Send weekly progress report to parent
export const sendWeeklyProgressReport = action({
  args: {
    studentId: v.id("students"),
    teacherId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Get student data
      const student = await ctx.runQuery(api.students.getStudent, { 
        studentId: args.studentId 
      });
      
      if (!student?.parentInfo?.email) {
        return { success: false, error: "No parent email on file" };
      }

      // Get recent progress (last week)
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentLessons = await ctx.runQuery(api.progress.getLessonHistoryByStudent, { 
        studentId: args.studentId,
        limit: 10
      });

      const weeklyLessons = recentLessons.filter(
        (lesson: any) => lesson.lessonDate >= oneWeekAgo && lesson.lessonStatus === "completed"
      );

      if (weeklyLessons.length === 0) {
        return { success: false, error: "No lessons completed this week" };
      }

      // Get teacher data
      const teacher = await ctx.runQuery(api.users.getUserById, { 
        userId: args.teacherId 
      });
      
      if (!teacher) {
        return { success: false, error: "Teacher not found" };
      }

      // Generate weekly report email
      const emailHtml = generateWeeklyReportHTML({
        student,
        teacher,
        weeklyLessons,
      });

      const emailSubject = `${student.name}'s Weekly English Progress Report`;

      // Send email
      const resend = getResendClient();
      const emailResult = await resend.emails.send({
        from: `${teacher.name} <lessons@teachai-app.com>`,
        to: [student.parentInfo.email],
        subject: emailSubject,
        html: emailHtml,
        replyTo: teacher.email || "noreply@teachai-app.com",
      });

      if (emailResult.error) {
        return { 
          success: false, 
          error: `Email service error: ${emailResult.error.message}` 
        };
      }

      return { 
        success: true, 
        messageId: emailResult.data?.id 
      };

    } catch (error) {
      console.error("Weekly report email error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

// Generate HTML email template for lesson summary
function generateLessonSummaryHTML({ student, lesson, progress, teacher }: {
  student: any;
  lesson: any;
  progress: any;
  teacher: any;
}) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getSkillDescription = (skill: string, score: number) => {
    const descriptions = {
      reading: score >= 8 ? "Excellent comprehension" : score >= 6 ? "Good progress" : score >= 4 ? "Developing skills" : "Needs more practice",
      writing: score >= 8 ? "Strong writing skills" : score >= 6 ? "Good structure" : score >= 4 ? "Basic writing" : "Needs improvement",
      speaking: score >= 8 ? "Confident speaker" : score >= 6 ? "Good fluency" : score >= 4 ? "Building confidence" : "Needs more practice",
      listening: score >= 8 ? "Excellent comprehension" : score >= 6 ? "Good understanding" : score >= 4 ? "Fair comprehension" : "Needs more work",
      grammar: score >= 8 ? "Strong grammar knowledge" : score >= 6 ? "Good understanding" : score >= 4 ? "Basic grammar" : "Needs review",
      vocabulary: score >= 8 ? "Rich vocabulary" : score >= 6 ? "Good word knowledge" : score >= 4 ? "Building vocabulary" : "Limited vocabulary"
    };
    return descriptions[skill as keyof typeof descriptions] || "In progress";
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lesson Summary - ${student.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .skill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .skill-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; }
        .skill-score { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .topics { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .homework { background: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .notes { background: #f1f5f9; border: 1px solid #64748b; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>English Lesson Summary</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${student.name} • ${formatDate(lesson.scheduledAt)}</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Skills Assessment</h2>
          <div class="skill-grid">
            ${Object.entries(progress.skills).map(([skill, score]: [string, any]) => `
              <div class="skill-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 600; text-transform: capitalize;">${skill}</span>
                  <span class="skill-score">${score}/10</span>
                </div>
                <div style="color: #64748b; font-size: 14px; margin-top: 5px;">
                  ${getSkillDescription(skill, score as number)}
                </div>
              </div>
            `).join('')}
          </div>

          ${progress.topicsCovered && progress.topicsCovered.length > 0 ? `
            <div class="topics">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">Topics Covered Today</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${progress.topicsCovered.map((topic: string) => `<li>${topic}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${progress.notes && progress.notes.trim() ? `
            <div class="notes">
              <h3 style="margin: 0 0 10px 0; color: #475569;">💭 Teacher's Notes</h3>
              <p style="margin: 0;">${progress.notes}</p>
            </div>
          ` : ''}

          ${progress.homework && progress.homework.assigned ? `
            <div class="homework">
              <h3 style="margin: 0 0 10px 0; color: #059669;">Homework Assignment</h3>
              <p style="margin: 0; font-weight: 500;">${progress.homework.assigned}</p>
              ${progress.homework.completed ? `
                                  <p style="margin: 10px 0 0 0; color: #059669; font-weight: 600;">Previous homework completed</p>
                ${progress.homework.feedback ? `<p style="margin: 5px 0 0 0; font-style: italic;">"${progress.homework.feedback}"</p>` : ''}
              ` : ''}
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <h3 style="color: #1e40af;">Next Steps</h3>
            <p>Continue practicing the topics covered today. If you have any questions about ${student.name}'s progress, please don't hesitate to reach out!</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>${teacher.name}</strong><br>
          English Teacher | TeachAI<br>
          ${teacher.email}</p>
          <p style="margin-top: 15px; font-size: 12px;">
            This email was sent automatically after ${student.name}'s lesson. 
            Please save this for your records.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate HTML email template for weekly progress report
function generateWeeklyReportHTML({ student, teacher, weeklyLessons }: {
  student: any;
  teacher: any;
  weeklyLessons: any[];
}) {
  // Calculate weekly averages
  const skillTotals = {
    reading: 0, writing: 0, speaking: 0,
    listening: 0, grammar: 0, vocabulary: 0
  };

  const lessonsWithSkills = weeklyLessons.filter(lesson => lesson.skills);
  
  if (lessonsWithSkills.length > 0) {
    lessonsWithSkills.forEach(lesson => {
      Object.keys(skillTotals).forEach(skill => {
        skillTotals[skill as keyof typeof skillTotals] += lesson.skills[skill];
      });
    });

    Object.keys(skillTotals).forEach(skill => {
      skillTotals[skill as keyof typeof skillTotals] = 
        Math.round((skillTotals[skill as keyof typeof skillTotals] / lessonsWithSkills.length) * 10) / 10;
    });
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Progress Report - ${student.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-item { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 6px; padding: 15px; text-align: center; }
        .skill-progress { margin: 20px 0; }
        .skill-bar { background: #e5e7eb; height: 8px; border-radius: 4px; margin: 5px 0; }
        .skill-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
        .lessons-list { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Weekly Progress Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${student.name}</p>
        </div>
        
        <div class="content">
          <div class="stats">
            <div class="stat-item">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">${weeklyLessons.length}</div>
              <div style="font-size: 14px; color: #064e3b;">Lessons</div>
            </div>
            <div class="stat-item">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">${lessonsWithSkills.length > 0 ? Object.values(skillTotals).reduce((a, b) => a + b, 0) / 6 : 0}/10</div>
              <div style="font-size: 14px; color: #064e3b;">Avg Score</div>
            </div>
            <div class="stat-item">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">↗</div>
              <div style="font-size: 14px; color: #064e3b;">Improving</div>
            </div>
          </div>

          ${lessonsWithSkills.length > 0 ? `
            <h3 style="color: #047857;">Skills Progress This Week</h3>
            <div class="skill-progress">
              ${Object.entries(skillTotals).map(([skill, score]) => `
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 600; text-transform: capitalize;">${skill}</span>
                    <span style="font-weight: bold;">${score}/10</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" style="width: ${(score / 10) * 100}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="lessons-list">
            <h3 style="margin: 0 0 15px 0; color: #047857;">This Week's Lessons</h3>
            ${weeklyLessons.map(lesson => `
              <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="font-weight: 600;">${new Date(lesson.lessonDate).toLocaleDateString()}</div>
                ${lesson.skills ? `<div style="font-size: 14px; color: #64748b;">Average: ${(Number(Object.values(lesson.skills).reduce((a: number, b: any) => a + Number(b), 0)) / 6).toFixed(1)}/10</div>` : ''}
                ${lesson.topicsCovered && lesson.topicsCovered.length > 0 ? `<div style="font-size: 14px; color: #64748b;">Topics: ${lesson.topicsCovered.join(', ')}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">Recommendations</h3>
            <p style="margin: 0;">Continue the excellent progress! Focus on areas with lower scores for balanced improvement.</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
          <p><strong>${teacher.name}</strong><br>
          English Teacher | TeachAI<br>
          ${teacher.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 