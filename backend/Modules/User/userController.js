import User from "../../models/User.js";
import UserSettings from "../../models/UserSettings.js";
import bcrypt from "bcrypt";
import { isStrongPassword } from "../../utils/validators.js";
// the part added recently for admin dashboard
import { Analysis } from "../../models/Analysis.js";
import { interviewSessionModel as InterviewSession } from "../../models/Interview/InterviewSession.js";import Roadmap from "../../models/Roadmap.js";
import { catchAsync } from "../../utils/validators.js";
import { CV } from "../../models/CV/CV.js"; 

// GET /api/users/me
export const getCurrentUser = async (req, res) => {
console.log("Check Headers:", req.headers.authorization); 
  console.log("Check req.user:", req.user);
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me
export const updateCurrentUser = async (req, res) => {
  if (req.body.email) {
    return res.status(400).json({ message: "You can't update email" });
  }

  const { name, avatar_url } = req.body;
  const update = {};

  if (name !== undefined) update.name = name;
  if (avatar_url !== undefined) update.avatar_url = avatar_url;

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    }).select("-password_hash");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/me/avatar
export const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const avatar_url = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar_url },
      { new: true, runValidators: true },
    ).select("-password_hash");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Weak password" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is wrong" });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/me
export const deleteCurrentUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await UserSettings.deleteOne({ user_id: req.user.id });
    res.json({ message: "Your account has been deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'cvs',
          localField: '_id',
          foreignField: 'userId',
          as: 'userCvs'
        }
      },
      {
        $addFields: {
          cvCount: { $size: "$userCvs" }
        }
      },

      { 
        $project: { 
          password_hash: 0, 
          userCvs: 0 
        } 
      }
    ]);

    res.json(users);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ message: err.message });
  }
};
// PUT /api/admin/users/:id/ban
export const banUser = async (req, res) => {
  try {
    const { status, ban_reason, role } = req.body;
    const { id } = req.params;


    const normalizedStatus = status ? status.toLowerCase() : undefined;
    const normalizedRole = role ? role.toLowerCase() : undefined; 

    if (normalizedStatus && !["active", "suspended", "banned"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateFields = {};
    if (normalizedStatus !== undefined) updateFields.status = normalizedStatus;
    if (normalizedRole !== undefined) updateFields.role = normalizedRole;
    
    if (normalizedStatus === "banned") {
      updateFields.ban_reason = ban_reason || "No reason provided";
    } else {
      updateFields.ban_reason = null;
    }


    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields }, 
      { new: true, runValidators: true }
    ).select("-password_hash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Database Update Error:", err); 
    res.status(500).json({ message: "Server error during update", error: err.message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await UserSettings.deleteOne({ user_id: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// the part added recently for admin dashboard
// 1. grt all analysis for admin
export const getAllAnalysesForAdmin = catchAsync(async (req, res, next) => {
  const analyses = await Analysis.find({}); 
  res.json({
    success: true,
    data: analyses,
  });
});

// 1. grt all interviews for admin
export const getAllInterviewsForAdmin = catchAsync(async (req, res, next) => {
  const interviews = await InterviewSession.find({});
  res.json({
    success: true,
    data: interviews,
  });
});

// 1. grt all roadmap for admin
export const getAllRoadmapsForAdmin = catchAsync(async (req, res, next) => {
  const roadmaps = await Roadmap.find({});
  res.json({
    success: true,
    data: roadmaps,
  });
});
export const getAdminDashboardReport = catchAsync(async (req, res, next) => {
    const [users, analyses, interviews, roadmaps, cvs] = await Promise.all([
        User.find({}),
        Analysis.find({}),
        InterviewSession.find({}),
        Roadmap.find({}),
        CV.find({})
    ]);

    const report = users.map(user => {
        const userId = user._id.toString();
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.created_at || user.createdAt,
            cvCount: cvs.filter(cv => cv.userId?.toString() === userId).length,
            analysisCount: analyses.filter(a => a.userId?.toString() === userId).length,
            interviewCount: interviews.filter(i => i.user_id?.toString() === userId).length,
            roadmapCount: roadmaps.filter(r => r.userId?.toString() === userId).length
        };
    });

    res.json({ success: true, data: report });
});