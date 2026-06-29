// tests/job/job.controller.spec.js

import * as jobController from "../../Modules/jobDescription/job.controller.js";
import { JobDescription } from "../../models/jobDescription/JobDescription.js";

describe("Job Controller Unit Tests", () => {

    let req;
    let res;
    let next;

    const mockUser = {
        id: "user123",
        userId: "user123",
        role: "user"
    };

    const mockJob = {
        _id: "job123",
        title: "Frontend React Developer",
        descriptionText:
            "We are looking for React Developer with Tailwind CSS",
        createdBy: "user123",
        createdAt: new Date()
    };

    beforeEach(() => {

        jasmine.getEnv().allowRespy(true);

        req = {
            user: mockUser,
            body: {},
            params: {},
            query: {}
        };

        res = {

            status: jasmine.createSpy("status").and.callFake(function () {
                return res;
            }),

            json: jasmine.createSpy("json").and.callFake(function () {
                return res;
            })

        };

        next = jasmine.createSpy("next");

    });

    afterEach(() => {
        jasmine.getEnv().allowRespy(true);
    });

    describe("createJobDescription()", () => {

        it("should create new job successfully", async () => {

            req.body = {
                title: "Frontend React Developer",
                descriptionText:
                    "We are looking for React Developer with Tailwind CSS"
            };

            spyOn(JobDescription, "create").and.resolveTo(mockJob);

            await jobController.createJobDescription(req, res, next);

            expect(JobDescription.create).toHaveBeenCalledWith({

                createdBy: mockUser.id,

                title: req.body.title,

                descriptionText: req.body.descriptionText

            });

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({

                success: true,

                data: {

                    id: mockJob._id,

                    title: mockJob.title,

                    createdAt: mockJob.createdAt

                }

            });

        });

       it("should pass error to next when create fails", async () => {

    req.body = {
        title: "React",
        descriptionText: "React Job"
    };

    const error = new Error("Database Error");

    spyOn(JobDescription, "create").and.rejectWith(error);

    await jobController.createJobDescription(req, res, next);

    expect(next).toHaveBeenCalledWith(error);

});
    });
    describe("getMyJobDescriptions()", () => {

        it("should return all user jobs", async () => {

            const jobs = [
                mockJob,
                {
                    ...mockJob,
                    _id: "job2"
                }
            ];

            spyOn(JobDescription, "find").and.returnValue({

                sort: () => Promise.resolve(jobs)

            });

            await jobController.getMyJobDescriptions(req, res, next);

            expect(JobDescription.find).toHaveBeenCalledWith({

                createdBy: mockUser.id

            });

            expect(res.json).toHaveBeenCalledWith({

                success: true,

                data: jobs

            });

        });

       it("should pass error to next when database fails", async () => {

    const error = new Error("DB Error");

    spyOn(JobDescription, "find").and.returnValue({
        sort: () => Promise.reject(error)
    });

    await jobController.getMyJobDescriptions(req, res, next);

    expect(next).toHaveBeenCalledWith(error);

});

    });
    describe("getJobDescriptionById()", () => {

        it("should return single job successfully", async () => {

            req.params.id = mockJob._id;

            spyOn(JobDescription, "findOne").and.resolveTo(mockJob);

            await jobController.getJobDescriptionById(req, res);

            expect(JobDescription.findOne).toHaveBeenCalledWith({
                _id: mockJob._id,
                createdBy: mockUser.id
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockJob
            });

        });

        it("should return 404 if job not found", async () => {

            req.params.id = "notFound";

            spyOn(JobDescription, "findOne").and.resolveTo(null);

            await jobController.getJobDescriptionById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Job description not found"
            });

        });

        it("should return 500 if database throws error", async () => {

            req.params.id = mockJob._id;

            spyOn(JobDescription, "findOne").and.rejectWith(
                new Error("Database Error")
            );

            await jobController.getJobDescriptionById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

        });

    });


    describe("updateJobDescription()", () => {

        it("should update job successfully", async () => {

            req.params.id = mockJob._id;

            req.body = {
                title: "Updated React Developer"
            };

            const updatedJob = {
                ...mockJob,
                title: "Updated React Developer"
            };

            spyOn(JobDescription, "findOneAndUpdate")
                .and.resolveTo(updatedJob);

            await jobController.updateJobDescription(req, res);

            expect(JobDescription.findOneAndUpdate)
                .toHaveBeenCalled();

            expect(res.status)
                .toHaveBeenCalledWith(200);

            expect(res.json)
                .toHaveBeenCalledWith({

                    success: true,

                    message: "Updated successfully",

                    data: updatedJob

                });

        });

        it("should return 404 if job not found", async () => {

            req.params.id = "wrongId";

            spyOn(JobDescription, "findOneAndUpdate")
                .and.resolveTo(null);

            await jobController.updateJobDescription(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(404);

            expect(res.json)
                .toHaveBeenCalledWith({

                    success: false,

                    message: "Job description not found"

                });

        });

        it("should return 500 if update throws error", async () => {

            req.params.id = mockJob._id;

            spyOn(JobDescription, "findOneAndUpdate")
                .and.rejectWith(new Error("Update Error"));

            await jobController.updateJobDescription(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(500);

        });

    });


    describe("deleteJobDescription()", () => {

        it("should delete job successfully", async () => {

            req.params.id = mockJob._id;

            spyOn(JobDescription, "findOneAndDelete")
                .and.resolveTo(mockJob);

            await jobController.deleteJobDescription(req, res);

            expect(JobDescription.findOneAndDelete)
                .toHaveBeenCalledWith({

                    _id: mockJob._id,

                    createdBy: mockUser.id

                });

            expect(res.status)
                .toHaveBeenCalledWith(200);

            expect(res.json)
                .toHaveBeenCalledWith({

                    success: true,

                    message: "Deleted successfully"

                });

        });

        it("should return 404 if job not found", async () => {

            req.params.id = "wrongId";

            spyOn(JobDescription, "findOneAndDelete")
                .and.resolveTo(null);

            await jobController.deleteJobDescription(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(404);

            expect(res.json)
                .toHaveBeenCalledWith({

                    success: false,

                    message: "Job description not found"

                });

        });

        it("should return 500 if delete throws error", async () => {

            req.params.id = mockJob._id;

            spyOn(JobDescription, "findOneAndDelete")
                .and.rejectWith(new Error("Delete Error"));

            await jobController.deleteJobDescription(req, res);

            expect(res.status)
                .toHaveBeenCalledWith(500);

        });

    });

});