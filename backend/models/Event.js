import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isTeamEvent: { type: Boolean, default: false },
  maxTeamSize: { type: Number, default: 4 }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
