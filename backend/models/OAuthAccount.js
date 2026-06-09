import mongoose from 'mongoose';

const oauthAccountSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  provider: { 
    type: String, 
    enum: ['google', 'github'], 
    required: true 
  },
  provider_id: { 
    type: String, 
    required: true 
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

oauthAccountSchema.index({ provider: 1, provider_id: 1 }, { unique: true });

export default mongoose.model('OAuthAccount', oauthAccountSchema);