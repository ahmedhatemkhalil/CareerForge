import {interviewModel} from "../models/Interview.js";

const checkInterview = async (req, res, next)=>{
    const {id} = req.params;
    const interview = await interviewModel.findOne({_id: id, user: req.user.id});
    if(!interview){
        return res.status(404).json({message: "Interview not found"})
    }
    req.interview = interview;
    next();
}

export default checkInterview; 