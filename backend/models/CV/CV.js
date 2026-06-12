import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    extractedText: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['processing', 'completed', 'failed'], 
        default: 'processing' 
    },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    fileSizeKb: { type: Number, required: true }
}, { timestamps: true });

cvSchema.pre('save', async function() {
    if (this.isModified('isActive') && this.isActive === true) {
        await mongoose.model('CV').updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { $set: { isActive: false } }
        );
    }
});

export const CV = mongoose.model('CV', cvSchema);
