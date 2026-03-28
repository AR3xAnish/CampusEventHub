import express from 'express';
import { protect, organizerOnly } from '../middleware/auth.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

const router = express.Router();

// Track organizer scan timestamps to prevent rapid check-in abuse
const scanHistory = new Map();

// POST /checkin — Organizer scans QR and checks in a participant
router.post('/checkin', protect, organizerOnly, async (req, res) => {
  try {
    const organizerId = req.user.id;
    const now = Date.now();

    // Prevent suspicious rapid check-ins (less than 1500ms between checkins by same organizer)
    if (scanHistory.has(organizerId)) {
      if (now - scanHistory.get(organizerId) < 1500) {
        return res.status(429).json({ message: 'Suspicious rapid check-in detected. Please wait before scanning again.' });
      }
    }

    // Will update scan time only on successful DB query to prevent blocking from bad requests
    scanHistory.set(organizerId, now);

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

    // All registrations for this organizer's events
    const allRegistrations = await Registration.find({ event: { $in: eventIds } })
      .populate('event', 'title category date capacity');

    const totalRegistrations = allRegistrations.length;
    const totalCheckedIn = allRegistrations.filter(r => r.checkedIn).length;

    // Per-event data for bar chart
    const perEvent = events.map(event => {
      const regs = allRegistrations.filter(r => r.event?._id?.toString() === event._id.toString());
      return {
        name: event.title.length > 18 ? event.title.slice(0, 18) + '…' : event.title,
        fullName: event.title,
        registered: regs.length,
        checkedIn: regs.filter(r => r.checkedIn).length,
        capacity: event.capacity || 0,
        category: event.category || 'Other',
      };
    });

    // Category breakdown for pie chart
    const categoryMap = {};
    events.forEach(e => {
      const cat = e.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Status breakdown  
    const statusMap = { Upcoming: 0, Ongoing: 0, Completed: 0 };
    events.forEach(e => { if (statusMap[e.status] !== undefined) statusMap[e.status]++; });
    const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Registrations over time (last 7 days)
    const now = new Date();
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const count = allRegistrations.filter(r => {
        const rd = new Date(r.createdAt);
        return rd.toDateString() === d.toDateString();
      }).length;
      return { date: label, registrations: count };
    });

    // Peak Check-in Times (by hour)
    const checkinByHour = Array(24).fill(0);
    allRegistrations.forEach(r => {
      if (r.checkedIn && r.checkedInAt) {
        const hour = new Date(r.checkedInAt).getHours();
        checkinByHour[hour]++;
      }
    });

    const peakCheckinTimes = checkinByHour.map((count, hour) => {
      const displayHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      return { time: displayHour, checkins: count, rawHour: hour };
    }).filter(d => d.checkins > 0 || (d.rawHour >= 8 && d.rawHour <= 20)); // Keep active daytime hours by default

    const eventsWithCounts = events.map(event => {
      const regs = allRegistrations.filter(r => r.event?._id?.toString() === event._id.toString());
      return { ...event.toObject(), registrationCount: regs.length };
    });

    res.json({
      totalEvents: events.length,
      totalRegistrations,
      totalCheckedIn,
      checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      events: eventsWithCounts,
      perEvent,
      categoryBreakdown,
      statusBreakdown,
      timeline,
      peakCheckinTimes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
