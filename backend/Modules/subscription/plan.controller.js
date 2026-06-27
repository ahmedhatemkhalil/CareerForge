import SubscriptionPlan from "../../models/SubscriptionPlan.js";

export const createPlan = async (req, res) => {
    try {
        const { name, limits } = req.body;

        // Check if the plan already exists to avoid duplicates
        const existingPlan = await SubscriptionPlan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({ 
                success: false, 
                message: "This plan already exists. Use update endpoint to modify its limits." 
            });
        }

        const newPlan = await SubscriptionPlan.create({
            name,
            limits
        });

        return res.status(201).json({ 
            success: true, 
            message: `Plan ${name} created successfully`, 
            data: newPlan 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getAllPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find();
        return res.status(200).json({ success: true, data: plans });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updatePlanLimits = async (req, res) => {
    try {
        const { name } = req.params; 
   
        const data = req.body.limits || req.body; 

        console.log("البيانات المستلمة في السيرفر:", data);

        const updatedPlan = await SubscriptionPlan.findOneAndUpdate(
            { name },
            { 
                $set: {
                    "limits.analysesPerMonth": data.analysesPerMonth,
                    "limits.interviewsPerMonth": data.interviewsPerMonth,
                    "limits.roadmapsPerMonth": data.roadmapsPerMonth
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ message: "The plan does not exist" });
        }

        return res.status(200).json({ success: true, data: updatedPlan });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};