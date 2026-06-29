// tests/analysis/analysis.controller.spec.js
import esmock from "esmock";
import * as analysisController from "../../Modules/Analysis/analysis.controller.js";
import { Analysis } from "../../models/Analysis.js";
import { CV } from "../../models/CV/CV.js";
import User from "../../models/User.js";
import { mockUser, mockCv, mockAiResult, mockJob } from "./analysis.mock.js";


let processAISpy;
let analysisController;

beforeAll(async () => {

    processAISpy = jasmine
        .createSpy("processAIAnalysisSync")
        .and.resolveTo(mockAiResult);

    analysisController = await esmock(
        "../../Modules/Analysis/analysis.controller.js",
        {
            "../../services/geminiService.js": {
                processAIAnalysisSync: processAISpy
            }
        }
    );

});

describe("Analysis Controller Unit Tests", () => {
    console.log("2");
    let req, res, next;

    beforeEach(() => {
        console.log("3");
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
        console.log("3");

console.log(typeof analysisService.processAIAnalysisSync);
console.log(analysisService.processAIAnalysisSync);

spyOn(User, "findById").and.resolveTo(mockUser);
spyOn(User, "findByIdAndUpdate").and.resolveTo({});
spyOn(CV, "findOne").and.resolveTo(mockCv);

console.log("before spy");

spyOn(analysisService, "processAIAnalysisSync").and.resolveTo(mockAiResult);

console.log("after spy");
    });

    // ================= CREATE =================
    describe("createAnalysis", () => {
        console.log("4");
       it("should create analysis successfully", async () => {

    console.log("A");

    spyOn(Analysis, "findOne").and.returnValue({
        sort: () => Promise.resolve(null)
    });

    console.log("B");
    console.log(typeof Analysis.create);
console.log(Analysis.create);
    spyOn(Analysis, "create").and.callFake(async () => {
    console.log("Analysis.create called");
    return {
        _id: "analysis123",
        ...mockAiResult
    };
});

analysisService.processAIAnalysisSync.and.callFake(async () => {
    console.log("AI MOCK CALLED");
    return mockAiResult;
});

    console.log("C");

    await analysisController.createAnalysis(req, res, next);

    console.log("D");

    expect(res.status).toHaveBeenCalledWith(201);

    console.log("E");

    expect(res.json).toHaveBeenCalled();

    console.log("F");
});
        it("should call next if CV not found", async () => {
            CV.findOne.and.resolveTo(null);

            await analysisController.createAnalysis(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it("should call next if AI fails", async () => {
analysisService.processAIAnalysisSync.and.returnValue(
    Promise.reject(new Error("AI Error"))
);
      console.log(typeof Analysis.findOne);
            spyOn(Analysis, "findOne").and.returnValue({
                sort: () => Promise.resolve(null)
            });

            await analysisController.createAnalysis(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ================= GET BY ID =================
    describe("getSingleAnalysis", () => {
        it("should return analysis", async () => {
            req.params.id = "analysis123";

            // 👈 جعل الـ chain مرن جداً عشان يقبل أي ترتيب للـ populate في الـ Controller
            const mockChain = {
                populate: jasmine.createSpy("populate").and.callFake(() => mockChain),
                exec: jasmine.createSpy("exec").and.resolveTo(mockAiResult),
                then: jasmine.createSpy("then").and.callFake((callback) => Promise.resolve(callback(mockAiResult)))
            };
            // يدعم لو الـ controller شغال بـ await أو دوت ثم
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