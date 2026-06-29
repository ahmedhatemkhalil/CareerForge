// tests/analysis/analysis.controller.spec.js
import * as analysisController from "../../Modules/Analysis/analysis.controller.js";
import { Analysis } from "../../models/Analysis.js";
import { CV } from "../../models/CV/CV.js";
import User from "../../models/User.js";
import { mockUser, mockCv, mockAiResult, mockJob } from "./analysis.mock.js";

describe("Analysis Controller Unit Tests", () => {
    let req, res, next;

    beforeEach(() => {
        jasmine.getEnv().allowRespy(true);

        req = {
            user: { id: mockUser._id, _id: mockUser._id },
            body: {
                cvId: mockCv._id,
                jobId: mockJob._id
            },
            params: {}
        };

        res = {
            status: jasmine.createSpy("status").and.callFake(function () {
                return this;
            }),
            json: jasmine.createSpy("json").and.callFake(function () {
                return this;
            })
        };

        next = jasmine.createSpy("next");

        // ================= GLOBAL MOCKS =================
        spyOn(User, "findById").and.resolveTo(mockUser);
        spyOn(User, "findByIdAndUpdate").and.resolveTo({});
        spyOn(CV, "findOne").and.resolveTo(mockCv);
    });

    // ================= GET BY ID =================
    describe("getSingleAnalysis", () => {
        it("should return analysis", async () => {
            req.params.id = "analysis123";

            const mockChain = {
                populate: jasmine.createSpy("populate").and.callFake(() => mockChain),
                exec: jasmine.createSpy("exec").and.resolveTo(mockAiResult),
                then: jasmine.createSpy("then").and.callFake((callback) => Promise.resolve(callback(mockAiResult)))
            };
            spyOn(Analysis, "findOne").and.callFake(() => mockChain);
            spyOn(Analysis, "findById").and.callFake(() => mockChain);

            await analysisController.getSingleAnalysis(req, res, next);

            expect(res.json).toHaveBeenCalled();
        });

        it("should call next if not found", async () => {
            req.params.id = "wrong";

            const mockChainNull = {
                populate: jasmine.createSpy("populate").and.callFake(() => mockChainNull),
                exec: jasmine.createSpy("exec").and.resolveTo(null),
                then: jasmine.createSpy("then").and.callFake((callback) => Promise.resolve(callback(null)))
            };
            spyOn(Analysis, "findOne").and.callFake(() => mockChainNull);
            spyOn(Analysis, "findById").and.callFake(() => mockChainNull);

            await analysisController.getSingleAnalysis(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ================= GET ALL =================
    describe("getAllAnalyses", () => {
        it("should return all analyses", async () => {
            const mockChainAll = {
                populate: jasmine.createSpy("populate").and.callFake(() => mockChainAll),
                sort: jasmine.createSpy("sort").and.callFake(() => mockChainAll),
                exec: jasmine.createSpy("exec").and.resolveTo([mockAiResult]),
                then: jasmine.createSpy("then").and.callFake((callback) => Promise.resolve(callback([mockAiResult])))
            };
            spyOn(Analysis, "find").and.callFake(() => mockChainAll);

            await analysisController.getAllAnalyses(req, res, next);

            expect(res.json).toHaveBeenCalled();
        });
    });

    // ================= DELETE =================
    describe("deleteAnalysis", () => {
        it("should delete analysis", async () => {
            req.params.id = "analysis123";

            spyOn(Analysis, "findOneAndDelete").and.resolveTo(mockAiResult);
            spyOn(Analysis, "findByIdAndDelete").and.resolveTo(mockAiResult);

            await analysisController.deleteAnalysis(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should call next if not found", async () => {
            req.params.id = "wrong";

            spyOn(Analysis, "findOneAndDelete").and.resolveTo(null);
            spyOn(Analysis, "findByIdAndDelete").and.resolveTo(null);

            await analysisController.deleteAnalysis(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});