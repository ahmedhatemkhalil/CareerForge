import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true, // مثلاً: Senior Backend Engineer
    },
    description_text: {
      type: String,
      required: true, // تفاصيل ومتطلبات الوظيفة بالكامل
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);
export default JobDescription;