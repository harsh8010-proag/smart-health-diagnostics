const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phlebotomist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCatalog',
      required: true,
    },
    slot: {
      type: Date,
      required: [true, 'Appointment slot is required'],
    },
    status: {
      type: String,
      enum: [
        'booked',
        'en_route',
        'arrived',
        'sample_collected',
        'in_transit',
        'processing',
        'completed',
      ],
      default: 'booked',
    },
    sampleBarcode: {
      type: String,
      default: null,
    },
    qrCodeToken: {
      type: String,
      required: true,
    },
    reportUrl: {
      type: String,
      default: null,
    },
    patientLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ patientLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
