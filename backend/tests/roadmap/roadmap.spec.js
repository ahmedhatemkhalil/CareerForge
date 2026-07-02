import request from "supertest";

import app from "../../app.js";
import Roadmap, { RoadmapWeek, Resource } from "../../models/Roadmap.js";
import * as roadmapService from "../../services/roadmap.service.js";
import {
  clearDatabase,
  closeDatabase,
  connectToTestDatabase,
} from "../../config/test-db.js";
import { mockRoadmapPlan } from "./roadmap.mock.js";
import {
  ROLE_ROADMAP,
  createRoleBasedRoadmap,
  createRoadmapUser,
  createWeekWithResource,
} from "./roadmap.helper.js";

describe("Roadmap Routes (integration / real DB)", () => {
  const testAgent = request(app);
  let token;
  let user;

  beforeAll(async () => {
    await connectToTestDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  beforeEach(() => {
    jasmine.getEnv().allowRespy(true);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  async function setupTestData(email = "roadmap-routes@test.com") {
    ({ user, token } = await createRoadmapUser(email));
  }

  it("(GET /api/roadmaps) without token should return 401", async () => {
    const res = await testAgent.get("/api/roadmaps");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authenticate/i);
  });

  it("(GET /api/roadmaps) should return an empty list", async () => {
    await setupTestData();

    const res = await testAgent
      .get("/api/roadmaps")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("(GET /api/roadmaps) should return user roadmaps from the database", async () => {
    await setupTestData("roadmap-list@test.com");
    await createRoleBasedRoadmap(user, { targetRole: "Backend Developer" });

    const res = await testAgent
      .get("/api/roadmaps")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].targetRole).toBe("Backend Developer");
    expect(res.body[0].currentRole).toBe(ROLE_ROADMAP.currentRole);
  });

  it("(GET /api/roadmaps/:id) should return 404 for invalid id", async () => {
    await setupTestData();

    const res = await testAgent
      .get("/api/roadmaps/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Roadmap not found");
  });

  it("(GET /api/roadmaps/:id) should return roadmap with weeks and resources", async () => {
    await setupTestData("roadmap-detail@test.com");
    const roadmap = await createRoleBasedRoadmap(user);
    await createWeekWithResource(roadmap._id, 1);

    const res = await testAgent
      .get(`/api/roadmaps/${roadmap._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(roadmap._id.toString());
    expect(res.body.weeks.length).toBe(1);
    expect(res.body.weeks[0].resources.length).toBe(1);
    expect(res.body.weeks[0].theme).toBe("Week 1 theme");
  });

  it("(PATCH /api/roadmaps/:id/progress) should update progress in the database", async () => {
    await setupTestData("roadmap-progress@test.com");
    const roadmap = await createRoleBasedRoadmap(user);

    const res = await testAgent
      .patch(`/api/roadmaps/${roadmap._id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ progress: 40 });

    expect(res.status).toBe(200);
    expect(res.body.progress).toBe(40);

    const savedRoadmap = await Roadmap.findById(roadmap._id);
    expect(savedRoadmap.progress).toBe(40);
  });

  it("(PATCH /api/roadmaps/:id/progress) should return 400 for invalid progress", async () => {
    await setupTestData("roadmap-invalid-progress@test.com");
    const roadmap = await createRoleBasedRoadmap(user);

    const res = await testAgent
      .patch(`/api/roadmaps/${roadmap._id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ progress: 150 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Progress must be between 0 and 100");
  });

  it("(PATCH /api/roadmaps/:id/week/:weekNum/complete) should mark week completed", async () => {
    await setupTestData("roadmap-complete-week@test.com");
    const roadmap = await createRoleBasedRoadmap(user, { totalWeeks: 1 });
    const { week } = await createWeekWithResource(roadmap._id, 1);

    const res = await testAgent
      .patch(`/api/roadmaps/${roadmap._id}/week/1/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.progress).toBe(100);
    expect(res.body.status).toBe("completed");

    const savedWeek = await RoadmapWeek.findById(week._id);
    expect(savedWeek.completed).toBe(true);
    expect(savedWeek.completedAt).not.toBeNull();
  });

  it("(DELETE /api/roadmaps/:id) should delete roadmap, weeks, and resources", async () => {
    await setupTestData("roadmap-delete@test.com");
    const roadmap = await createRoleBasedRoadmap(user);
    const { week, resource } = await createWeekWithResource(roadmap._id, 1);

    const res = await testAgent
      .delete(`/api/roadmaps/${roadmap._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Roadmap deleted successfully");

    expect(await Roadmap.findById(roadmap._id)).toBeNull();
    expect(await RoadmapWeek.findById(week._id)).toBeNull();
    expect(await Resource.findById(resource._id)).toBeNull();
  });

  it("(POST /api/roadmaps) should create roadmap from role transformation", async () => {
    await setupTestData("roadmap-create@test.com");
    spyOn(roadmapService, "generateRoadmapPlan").and.resolveTo(mockRoadmapPlan);

    const res = await testAgent
      .post("/api/roadmaps")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentRole: "Junior Developer",
        targetRole: "Full Stack Developer",
        hoursPerWeek: 12,
      });

    expect(res.status).toBe(201);
    expect(res.body.targetRole).toBe("Full Stack Developer");
    expect(res.body.weeks.length).toBe(2);
    expect(roadmapService.generateRoadmapPlan).toHaveBeenCalled();

    const savedRoadmap = await Roadmap.findOne({ userId: user._id });
    expect(savedRoadmap).not.toBeNull();
    expect(savedRoadmap.hoursPerWeek).toBe(12);

    const weeks = await RoadmapWeek.find({ roadmapId: savedRoadmap._id });
    expect(weeks.length).toBe(2);
  });
});
