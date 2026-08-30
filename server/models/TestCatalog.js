const mongoose = require('mongoose');

const testCatalogSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: [true, 'Test name is required'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    fastingHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    sampleType: {
      type: String,
      enum: ['EDTA', 'Serum', 'Fluoride', 'Citrate', 'Heparin'],
      required: [true, 'Sample type is required'],
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestCatalog', testCatalogSchema);
