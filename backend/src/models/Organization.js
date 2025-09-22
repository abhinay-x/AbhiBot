import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  domain: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  settings: {
    defaultLanguage: { type: String, default: 'en' },
    allowPublicBots: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

organizationSchema.index({ name: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
