import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  leaderUSN: { type: String, required: true },
  teamMembers: [{
    name: { type: String, required: true },
    usn: { type: String, required: true }
  }],
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
