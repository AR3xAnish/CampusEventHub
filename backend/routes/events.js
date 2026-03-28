import express from 'express';
import { protect, organizerOnly } from '../middleware/auth.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer', 'name email');
    // Attach registration count to each event so the frontend can show "Full" state
    const eventsWithCounts = await Promise.all(events.map(async (event) => {
      const regCount = await Registration.countDocuments({ event: event._id });
      return { ...event.toObject(), registrationCount: regCount };
    }));
    res.json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, organizerOnly, async (req, res) => {
  try {
    const { title, description, date, venue, capacity, isTeamEvent, maxTeamSize } = req.body;
    const event = new Event({
      title,
      description,
      date,
      venue,
      capacity: Number(capacity) || 0,
      isTeamEvent: isTeamEvent ?? false,
      maxTeamSize: maxTeamSize || 4,
      organizer: req.user.id
    });
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, organizerOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, organizerOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ event: req.params.id });
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
