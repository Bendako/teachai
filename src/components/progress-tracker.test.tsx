import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProgressTracker } from "./progress-tracker";

const { useQueryMock, useMutationMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useMutationMock: vi.fn(() => vi.fn()),
}));

vi.mock("convex/react", () => ({
  useQuery: useQueryMock,
  useMutation: useMutationMock,
}));

const lessonProps = {
  lessonId: "lesson-1" as never,
  studentId: "student-1" as never,
  teacherId: "teacher-1" as never,
};

const existingProgress = {
  _id: "progress-1" as never,
  _creationTime: 1,
  lessonId: lessonProps.lessonId,
  studentId: lessonProps.studentId,
  teacherId: lessonProps.teacherId,
  skills: {
    reading: 8,
    writing: 7,
    speaking: 6,
    listening: 9,
    grammar: 4,
    vocabulary: 10,
  },
  topicsCovered: ["Past tense", "Travel vocabulary"],
  notes: "Strong participation",
  homework: {
    assigned: "Write a travel diary",
    completed: true,
    feedback: "Clear and detailed",
  },
  createdAt: 1,
};

describe("ProgressTracker existing-data initialization", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useMutationMock.mockReturnValue(vi.fn());
  });

  it("renders stored progress values and does not offer Save Progress before editing", () => {
    useQueryMock.mockReturnValue(existingProgress);

    render(<ProgressTracker {...lessonProps} />);

    expect(screen.getByDisplayValue("Strong participation")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Write a travel diary")).toBeInTheDocument();
    expect(screen.getByText("Past tense")).toBeInTheDocument();
    expect(screen.getByDisplayValue("8")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Progress" })).not.toBeInTheDocument();
  });

  it("marks the draft changed after a user edit", () => {
    useQueryMock.mockReturnValue(existingProgress);

    render(<ProgressTracker {...lessonProps} />);
    fireEvent.change(screen.getByDisplayValue("Strong participation"), {
      target: { value: "Updated notes" },
    });

    expect(screen.getByRole("button", { name: "Save Progress" })).toBeInTheDocument();
  });

  it("keeps defaults for a new progress record", () => {
    useQueryMock.mockReturnValue(null);

    render(<ProgressTracker {...lessonProps} />);

    expect(screen.getAllByRole("slider")).toHaveLength(6);
    expect(screen.getAllByRole("slider").every((slider) => (slider as HTMLInputElement).value === "5")).toBe(true);
    expect(screen.getByPlaceholderText("Record observations, areas for improvement, student behavior, breakthroughs, etc...")).toHaveValue("");
    expect(screen.getByPlaceholderText("Assign homework or practice exercises...")).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Save Progress" })).not.toBeInTheDocument();
  });
});
