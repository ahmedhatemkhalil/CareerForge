import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file_url: {
      type: String,
      required: true, // مسار الـ S3 أو التخزين السحابي
    },
    file_name: {
      type: String,
      required: true,
    },
    extracted_text: {
      type: String,
      default: '', // النص المستخرج اللي هيروح للـ Langflow
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
    version: {
      type: Number,
      default: 1,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    file_size_kb: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: 'uploaded_at', updatedAt: 'updated_at' },
  }
);

const CV = mongoose.model('CV', cvSchema);
export default CV;