import express from 'express';
import { protect, organizerOnly } from '../middleware/auth.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

const router = express.Router();

// POST /checkin — Organizer scans QR and checks in a participant
router.post('/checkin', protect, organizerOnly, async (req, res) => {
  try {
    const { registrationId } = req.body;
    if (!registrationId) {
      return res.status(400).json({ message: 'Registration ID is required' });
    }

    const registration = await Registration.findById(registrationId)
      .populate('event')
      .populate('student', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found. Invalid QR code.' });
    }

    // Ensure the organizer owns the event
    if (registration.event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the organizer of this event.' });
    }

    if (registration.checkedIn) {
      return res.status(400).json({
        message: 'Already checked in.',
        registration,
        alreadyCheckedIn: true
      });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.json({ message: 'Check-in successful!', registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during check-in' });
  }
});

router.post('/:eventId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register for events' });
    }

    const eventId = req.params.eventId;
    const { leaderUSN, teamMembers } = req.body;

    if (!leaderUSN) {
      return res.status(400).json({ message: 'Leader USN is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existingRegistration = await Registration.findOne({ student: req.user.id, event: eventId });
    if (existingRegistration) return res.status(400).json({ message: 'Already registered for this event' });

    const regCount = await Registration.countDocuments({ event: eventId });
    const maxCapacity = Number(event.capacity);
    if (maxCapacity > 0 && regCount >= maxCapacity) {
      return res.status(400).json({ message: 'This event is full. No more registrations are being accepted.' });
    }

    const registration = new Registration({
      student: req.user.id,
      event: eventId,
      leaderUSN,
      teamMembers: teamMembers || []
    });
    await registration.save();
    res.status(201).json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-events', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user.id }).populate('event');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/event/:eventId', protect, organizerOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || event.organizer.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to view participants for this event' });
    }
    const registrations = await Registration.find({ event: req.params.eventId }).populate('student', 'name email');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/organizer/stats', protect, organizerOnly, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    const eventIds = events.map(e => e._id);
    const registrationsCount = await Registration.countDocuments({ event: { $in: eventIds } });

    res.json({
      totalEvents: events.length,
      totalRegistrations: registrationsCount,
      events: events
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
