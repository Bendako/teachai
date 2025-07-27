/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiGeneration from "../aiGeneration.js";
import type * as aiLessonPlans from "../aiLessonPlans.js";
import type * as aiService from "../aiService.js";
import type * as analytics from "../analytics.js";
import type * as emails from "../emails.js";
import type * as enhancedLessonGeneration from "../enhancedLessonGeneration.js";
import type * as files from "../files.js";
import type * as lessonGeneration from "../lessonGeneration.js";
import type * as lessons from "../lessons.js";
import type * as progress from "../progress.js";
import type * as progressAnalysis from "../progressAnalysis.js";
import type * as seedData from "../seedData.js";
import type * as students from "../students.js";
import type * as test from "../test.js";
import type * as testSetup from "../testSetup.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiGeneration: typeof aiGeneration;
  aiLessonPlans: typeof aiLessonPlans;
  aiService: typeof aiService;
  analytics: typeof analytics;
  emails: typeof emails;
  enhancedLessonGeneration: typeof enhancedLessonGeneration;
  files: typeof files;
  lessonGeneration: typeof lessonGeneration;
  lessons: typeof lessons;
  progress: typeof progress;
  progressAnalysis: typeof progressAnalysis;
  seedData: typeof seedData;
  students: typeof students;
  test: typeof test;
  testSetup: typeof testSetup;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
