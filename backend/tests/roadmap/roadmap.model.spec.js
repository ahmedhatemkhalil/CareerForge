import mongoose from "mongoose";

import Roadmap, {
  Resource,
  RoadmapWeek,
  syncRoadmapProgress,
} from "../../models/Roadmap.js";
import {
  clearDatabase,
  closeDatabase,
  connectToTestDatabase,
} from "../../config/test-db.js";

describe("Roadmap Model", () => {
  it("should apply roadmap defaults", () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(),
      currentRole: "Junior Developer",
      targetRole: "Senior Developer",
    });

    expect(roadmap.hoursPerWeek).toBe(10);
    expect(roadmap.status).toBe("active");
    expect(roadmap.progress).toBe(0);
    expect(roadmap.completedWeeks).toBe(0);
    expect(roadmap.totalWeeks).toBe(0);
  });

  it("should require userId", () => {
    const roadmap = new Roadmap({
      currentRole: "Junior Developer",
      targetRole: "Senior Developer",
    });

    const error = roadmap.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.userId).toBeDefined();
  });

  it("should require currentRole and targetRole without analysisId", () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(),
    });

    const error = roadmap.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.currentRole).toBeDefined();
    expect(error.errors.targetRole).toBeDefined();
  });

  it("should allow roadmap with analysisId without roles", () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(),
      analysisId: new mongoose.Types.ObjectId(),
    });

    const error = roadmap.validateSync();

    expect(error).toBeUndefined();
  });

  it("should reject invalid roadmap status", () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(),
      currentRole: "Junior Developer",
      targetRole: "Senior Developer",
      status: "archived",
    });

    const error = roadmap.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.status).toBeDefined();
  });

  it("should reject matchScore above 100", () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(),
      currentRole: "Junior Developer",
      targetRole: "Senior Developer",
      matchScore: 150,
    });

    const error = roadmap.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.matchScore).toBeDefined();
  });

  it("should require week theme and weekNumber", () => {
    const week = new RoadmapWeek({
      roadmapId: new mongoose.Types.ObjectId(),
    });

    const error = week.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.weekNumber).toBeDefined();
    expect(error.errors.theme).toBeDefined();
  });

  it("should reject invalid resource type", () => {
    const resource = new Resource({
      weekId: new mongoose.Types.ObjectId(),
      title: "Invalid Resource",
      url: "https://example.com",
      type: "podcast",
    });

    const error = resource.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.type).toBeDefined();
  });
});

describe("syncRoadmapProgress", () => {
  beforeAll(async () => {
    await connectToTestDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("should calculate progress from completed weeks", async () => {
    const userId = new mongoose.Types.ObjectId();
    const roadmap = await Roadmap.create({
      userId,
      currentRole: "Junior Developer",
      targetRole: "Senior Developer",
    });

    await RoadmapWeek.create({
      roadmapId: roadmap._id,
      weekNumber: 1,
      theme: "Week 1",
      completed: true,
      completedAt: new Date(),
    });
    await RoadmapWeek.create({
      roadmapId: roadmap._id,
      weekNumber: 2,
      theme: "Week 2",
      completed: false,
    });

    const updated = await syncRoadmapProgress(roadmap._id);

    expect(updated.totalWeeks).toBe(2);
    expect(updated.completedWeeks).toBe(1);
    expect(updated.progress).toBe(50);
    expect(updated.status).toBe("active");
  });

  it("should mark roadmap completed when all weeks are done", async () => {
    const userId = new mongoose.Types.ObjectId();
    const roadmap = await Roadmap.create({
      userId,
      currentRole: "Junior Developer",
      targetRole: "Senior Developer",
    });

    await RoadmapWeek.create({
      roadmapId: roadmap._id,
      weekNumber: 1,
      theme: "Week 1",
      completed: true,
      completedAt: new Date(),
    });

    const updated = await syncRoadmapProgress(roadmap._id);

    expect(updated.progress).toBe(100);
    expect(updated.status).toBe("completed");
  });
});
