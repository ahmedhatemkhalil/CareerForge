import * as cvController from "../../Modules/CV/cv.controller.js"; 
import { CV } from "../../models/CV/CV.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

const uploadCV = cvController.uploadCV;
const getCvById = cvController.getCvById;
const deleteCV = cvController.deleteCV || cvController.deleteCv || cvController.removeCV;

describe("CV Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    spyOn(global, 'setImmediate').and.callFake((callback) => {});
    spyOn(CV, "findByIdAndUpdate").and.resolveTo(true);
    spyOn(CV, "updateMany").and.resolveTo(true);

    req = {
      user: { id: "user123", role: "user" },
      body: {},
      params: { cvId: "cv123" },
      query: {},
      file: {
        path: "fake/path/cv.pdf",
        originalname: "cv.pdf",
        size: 1024,
      },
      fileValidationError: null,
    };

    res = {
      status: jasmine.createSpy("status").and.callFake(function (code) {
        this.statusCode = code;
        return this;
      }),
      json: jasmine.createSpy("json").and.callFake(function (data) {
        this.body = data;
        return Promise.resolve(this);
      }),
    };

    next = jasmine.createSpy("next").and.callFake((err) => {
      return Promise.resolve(err);
    });
  });

  if (uploadCV) {
    describe("uploadCV()", () => {
     it("should upload CV successfully", async () => {

  const mockQuery = {
    sort: jasmine.createSpy().and.resolveTo(null),
  };

  spyOn(CV, "findOne").and.returnValue(mockQuery);

  spyOn(cloudinary.uploader, "upload").and.resolveTo({
    secure_url: "https://res.cloudinary.com/demo/image/upload/v123/cv.pdf",
  });

  spyOn(CV, "create").and.resolveTo({
    _id: "cv123",
    fileName: "cv.pdf",
    status: "processing",
  });

  spyOn(fs, "existsSync").and.returnValue(false);
  spyOn(fs, "unlinkSync");

  await uploadCV(req, res, next);

  expect(res.status).toHaveBeenCalledWith(201);
});
      it("should return error if file validation failed", async () => {
        req.fileValidationError = "Invalid file type";
        await uploadCV(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should return error if no file provided", async () => {
        req.file = null;
        await uploadCV(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });
  }

  if (getCvById) {
    describe("getCvById()", () => {
      it("should return single CV successfully", async () => {
        spyOn(CV, "findOne").and.resolveTo({
          _id: "cv123",
          fileName: "cv.pdf",
          fileUrl: "url"
        });

        await getCvById(req, res, next);
        expect(res.json).toHaveBeenCalled();
      });

      it("should return 404 if CV not found", async () => {
        spyOn(CV, "findOne").and.resolveTo(null);

        await getCvById(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });
  }

  if (deleteCV) {
    describe("deleteCV()", () => {
      it("should delete CV successfully from Cloudinary and DB", async () => {
        spyOn(CV, "findOne").and.resolveTo({
          _id: "cv123",
          userId: "user123",
          fileUrl: "https://res.cloudinary.com/demo/image/upload/v123/cv.pdf",
        });
        spyOn(cloudinary.uploader, "destroy").and.resolveTo({ result: "ok" });
        spyOn(CV, "findByIdAndDelete").and.resolveTo(true);

        await deleteCV(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
      });

      it("should return 404 if CV to delete is not found", async () => {
        spyOn(CV, "findOne").and.resolveTo(null);

        await deleteCV(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });
  }
});