import { JobDescription } from "../../models/jobDescription/JobDescription.js";
import { catchAsync, AppError } from "../../utils/validators.js";

// 1. Create Job Description (POST)
export const createJobDescription = catchAsync(async (req, res, next) => {
  const { title, descriptionText } = req.body;

  const newJob = await JobDescription.create({
    createdBy: req.user.id,
    title,
    descriptionText,
  });

  res.status(201).json({
    success: true,
    data: {
      id: newJob._id,
      title: newJob.title,
      createdAt: newJob.createdAt,
    },
  });
});

// 2. Get User's Job Descriptions (GET)
export const getMyJobDescriptions = catchAsync(async (req, res, next) => {
  const jobs = await JobDescription.find({ createdBy: req.user.id }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    data: jobs,
  });
});

// 3. Get Single Job Description by ID
export const getJobDescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobDescription.findOne({
      _id: id,
      createdBy: req.user.id || req.user.userId,
    });

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job description not found" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Job Description
export const updateJobDescription = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobDescription.findOneAndUpdate(
      { _id: id, createdBy: req.user.id || req.user.userId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job description not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Updated successfully", data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Job Description
export const deleteJobDescription = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobDescription.findOneAndDelete({
      _id: id,
      createdBy: req.user.id || req.user.userId,
    });

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job description not found" });
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
