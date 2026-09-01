const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper: get io instance from app
const getIO = (req) => req.app.get('io');

// POST /api/bookings/book — Patient books a test
router.post('/book', verifyToken, authorize('patient'), async (req, res) => {
  try {
    const { testId, slot, location } = req.body;

    const qrCodeToken = uuidv4();

    const booking = await Booking.create({
      patient: req.user._id,
      test: testId,
      slot: new Date(slot),
      qrCodeToken,
      patientLocation: location
        ? { type: 'Point', coordinates: location.coordinates || [0, 0] }
        : {
          type: 'Point',
          coordinates: req.user.location?.coordinates || [0, 0],
        },
    });

    const populated = await Booking.findById(booking._id)
      .populate('patient', 'name email')
      .populate('test');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Failed to create booking.' });
  }
});

// GET /api/bookings/my — Patient's bookings
router.get('/my', verifyToken, authorize('patient'), async (req, res) => {
  try {
    const bookings = await Booking.find({ patient: req.user._id })
      .populate('test')
      .populate('phlebotomist', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/phlebotomist/nearby — Nearby unassigned bookings
router.get(
  '/phlebotomist/nearby',
  verifyToken,
  authorize('phlebotomist'),
  async (req, res) => {
    try {
      const { lng, lat } = req.query;
      const longitude = parseFloat(lng) || req.user.location?.coordinates?.[0] || 0;
      const latitude = parseFloat(lat) || req.user.location?.coordinates?.[1] || 0;

      const bookings = await Booking.find({
        phlebotomist: null,
        status: 'booked',
        patientLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000, // 10km
          },
        },
      })
        .populate('patient', 'name email location age gender')
        .populate('test')
        .sort({ slot: 1 });

      res.json(bookings);
    } catch (err) {
      console.error('Nearby bookings error:', err);
      res.status(500).json({ message: 'Failed to fetch nearby bookings.' });
    }
  }
);

// GET /api/bookings/phlebotomist/assigned — Phlebotomist's assigned bookings
router.get(
  '/phlebotomist/assigned',
  verifyToken,
  authorize('phlebotomist'),
  async (req, res) => {
    try {
      const bookings = await Booking.find({
        phlebotomist: req.user._id,
        status: { $nin: ['completed'] },
      })
        .populate('patient', 'name email location')
        .populate('test')
        .sort({ slot: 1 });
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch assigned bookings.' });
    }
  }
);

// PATCH /api/bookings/:id/accept — Phlebotomist accepts a booking
router.patch(
  '/:id/accept',
  verifyToken,
  authorize('phlebotomist'),
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: 'Booking not found.' });
      if (booking.phlebotomist) {
        return res.status(400).json({ message: 'Booking already assigned.' });
      }

      booking.phlebotomist = req.user._id;
      booking.status = 'en_route';
      await booking.save();

      const populated = await Booking.findById(booking._id)
        .populate('patient', 'name email location')
        .populate('phlebotomist', 'name email')
        .populate('test');

      // Emit status change
      const io = getIO(req);
      io.to(`booking_${booking._id}`).emit('STATUS_CHANGED', {
        bookingId: booking._id,
        status: 'en_route',
      });

      res.json(populated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to accept booking.' });
    }
  }
);

// PATCH /api/bookings/:id/update-status — Update booking status
router.patch(
  '/:id/update-status',
  verifyToken,
  authorize('phlebotomist'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = [
        'en_route',
        'arrived',
        'sample_collected',
        'in_transit',
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status transition.' });
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test');

      if (!booking) return res.status(404).json({ message: 'Booking not found.' });

      const io = getIO(req);
      io.to(`booking_${booking._id}`).emit('STATUS_CHANGED', {
        bookingId: booking._id,
        status: booking.status,
      });

      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update status.' });
    }
  }
);

// PATCH /api/bookings/:id/scan-qr — Validate QR token
router.patch(
  '/:id/scan-qr',
  verifyToken,
  authorize('phlebotomist'),
  async (req, res) => {
    try {
      const { qrToken } = req.body;
      const booking = await Booking.findById(req.params.id);

      if (!booking) return res.status(404).json({ message: 'Booking not found.' });
      if (booking.qrCodeToken !== qrToken) {
        return res.status(400).json({ message: 'Invalid QR token.' });
      }

      booking.status = 'arrived';
      await booking.save();

      const populated = await Booking.findById(booking._id)
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test');

      const io = getIO(req);
      io.to(`booking_${booking._id}`).emit('STATUS_CHANGED', {
        bookingId: booking._id,
        status: 'arrived',
      });

      res.json(populated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to validate QR token.' });
    }
  }
);

// PATCH /api/bookings/:id/attach-barcode — Attach sample barcode
router.patch(
  '/:id/attach-barcode',
  verifyToken,
  authorize('phlebotomist'),
  async (req, res) => {
    try {
      const { barcode } = req.body;
      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { sampleBarcode: barcode, status: 'sample_collected' },
        { new: true }
      )
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test');

      if (!booking) return res.status(404).json({ message: 'Booking not found.' });

      const io = getIO(req);
      io.to(`booking_${booking._id}`).emit('SAMPLE_ATTACHED', {
        bookingId: booking._id,
        barcode: booking.sampleBarcode,
      });

      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Failed to attach barcode.' });
    }
  }
);

// GET /api/bookings/lab/incoming — Lab admin: incoming samples
router.get(
  '/lab/incoming',
  verifyToken,
  authorize('lab_admin'),
  async (req, res) => {
    try {
      const bookings = await Booking.find({
        status: { $in: ['in_transit', 'processing', 'sample_collected'] },
      })
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test')
        .sort({ updatedAt: -1 });
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch incoming samples.' });
    }
  }
);

// GET /api/bookings/lab/all — Lab admin: all bookings
router.get(
  '/lab/all',
  verifyToken,
  authorize('lab_admin'),
  async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test')
        .sort({ updatedAt: -1 });
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch bookings.' });
    }
  }
);

// PATCH /api/bookings/:id/process — Lab admin: update to processing
router.patch(
  '/:id/process',
  verifyToken,
  authorize('lab_admin'),
  async (req, res) => {
    try {
      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { status: 'processing' },
        { new: true }
      )
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test');

      if (!booking) return res.status(404).json({ message: 'Booking not found.' });

      const io = getIO(req);
      io.to(`booking_${booking._id}`).emit('STATUS_CHANGED', {
        bookingId: booking._id,
        status: 'processing',
      });

      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Failed to process sample.' });
    }
  }
);

// PATCH /api/bookings/:id/upload-report — Lab admin: upload report
router.patch(
  '/:id/upload-report',
  verifyToken,
  authorize('lab_admin'),
  async (req, res) => {
    try {
      const { reportUrl } = req.body;
      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { reportUrl, status: 'completed' },
        { new: true }
      )
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test');

      if (!booking) return res.status(404).json({ message: 'Booking not found.' });

      const io = getIO(req);
      io.to(`booking_${booking._id}`).emit('REPORT_READY', {
        bookingId: booking._id,
        reportUrl: booking.reportUrl,
      });

      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Failed to upload report.' });
    }
  }
);

// GET /api/bookings/lab/barcode/:barcode — Lab admin: lookup by barcode
router.get(
  '/lab/barcode/:barcode',
  verifyToken,
  authorize('lab_admin'),
  async (req, res) => {
    try {
      const booking = await Booking.findOne({ sampleBarcode: req.params.barcode })
        .populate('patient', 'name email')
        .populate('phlebotomist', 'name email')
        .populate('test');

      if (!booking) {
        return res.status(404).json({ message: 'No booking found for this barcode.' });
      }
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Failed to lookup barcode.' });
    }
  }
);

module.exports = router;
