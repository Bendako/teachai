import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

// Create a new student
export const createStudent = mutation({
  args: {
    teacherId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    goals: v.array(v.string()),
    notes: v.optional(v.string()),
    parentInfo: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      relationship: v.string(),
    })),
  },
  returns: v.id("students"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("students", {
      teacherId: args.teacherId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      level: args.level,
      goals: args.goals,
      notes: args.notes,
      parentInfo: args.parentInfo,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get all students for a teacher
export const getStudentsByTeacher = query({
  args: { 
    teacherId: v.id("users"),
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(v.object({
    _id: v.id("students"),
    _creationTime: v.number(),
    teacherId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    goals: v.array(v.string()),
    notes: v.optional(v.string()),
    parentInfo: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      relationship: v.string(),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("students")
        .withIndex("by_teacher_and_active", (q) => 
          q.eq("teacherId", args.teacherId).eq("isActive", true)
        )
        .order("desc")
        .collect();
    } else {
      return await ctx.db
        .query("students")
        .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
        .order("desc")
        .collect();
    }
  },
});

// Get a single student by ID
export const getStudent = query({
  args: { studentId: v.id("students") },
  returns: v.union(
    v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      teacherId: v.id("users"),
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.string()),
      level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
      goals: v.array(v.string()),
      notes: v.optional(v.string()),
      parentInfo: v.optional(v.object({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        relationship: v.string(),
      })),
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Update student information
export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    level: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    goals: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    parentInfo: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      relationship: v.string(),
    })),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { studentId, ...updates } = args;
    
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(studentId, {
        ...cleanUpdates,
        updatedAt: Date.now(),
      });
    }
  },
});

// Delete (deactivate) a student
export const deleteStudent = mutation({
  args: { studentId: v.id("students") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // We don't actually delete students, just mark them as inactive
    await ctx.db.patch(args.studentId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// Get students by level for a teacher
export const getStudentsByLevel = query({
  args: { 
    teacherId: v.id("users"),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
  },
  returns: v.array(v.object({
    _id: v.id("students"),
    _creationTime: v.number(),
    name: v.string(),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    goals: v.array(v.string()),
    isActive: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();
    
    return allStudents
      .filter(student => student.level === args.level && student.isActive)
      .map(student => ({
        _id: student._id,
        _creationTime: student._creationTime,
        name: student.name,
        level: student.level,
        goals: student.goals,
        isActive: student.isActive,
      }));
  },
});

// Search students by name
export const searchStudents = query({
  args: { 
    teacherId: v.id("users"),
    searchTerm: v.string(),
  },
  returns: v.array(v.object({
    _id: v.id("students"),
    _creationTime: v.number(),
    name: v.string(),
    email: v.optional(v.string()),
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    isActive: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    
    return allStudents
      .filter(student => 
        student.isActive && 
        (student.name.toLowerCase().includes(searchLower) ||
         (student.email && student.email.toLowerCase().includes(searchLower)))
      )
      .map(student => ({
        _id: student._id,
        _creationTime: student._creationTime,
        name: student.name,
        email: student.email,
        level: student.level,
        isActive: student.isActive,
      }));
  },
});

// Internal version of getStudent for use in actions
export const internalGetStudent = internalQuery({
  args: { studentId: v.id("students") },
  returns: v.union(
    v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      teacherId: v.id("users"),
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.string()),
      level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
      goals: v.array(v.string()),
      notes: v.optional(v.string()),
      parentInfo: v.optional(v.object({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        relationship: v.string(),
      })),
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
}); 