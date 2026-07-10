import Roadmap, { RoadmapWeek, Resource } from "../../models/Roadmap.js";
import { createUserAndToken } from "../user/user.helper.js";

export const ROLE_ROADMAP = {
  currentRole: "Junior Developer",
  targetRole: "Senior Developer",
};

export async function createRoadmapUser(email = "roadmap@test.com") {
  return createUserAndToken({ email, name: "Roadmap User" });
}

export async function createRoleBasedRoadmap(user, overrides = {}) {
  return Roadmap.create({
    userId: user._id,
    currentRole: ROLE_ROADMAP.currentRole,
    targetRole: ROLE_ROADMAP.targetRole,
    hoursPerWeek: 10,
    totalWeeks: 0,
    ...overrides,
  });
}

export async function createWeekWithResource(roadmapId, weekNumber = 1) {
  const week = await RoadmapWeek.create({
    roadmapId,
    weekNumber,
    theme: `Week ${weekNumber} theme`,
    description: `Study plan for week ${weekNumber}`,
  });

  const resource = await Resource.create({
    weekId: week._id,
    title: "React Documentation",
    url: "https://react.dev",
    type: "documentation",
    platform: "react.dev",
    isFree: true,
  });

  return { week, resource };
}
