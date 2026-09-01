require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const TestCatalog = require('./models/TestCatalog');
const Booking = require('./models/Booking');
const { v4: uuidv4 } = require('uuid');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-blood-testing';

const seedUsers = [
  {
    name: 'Arjun Patel',
    email: 'patient@test.com',
    password: 'password123',
    role: 'patient',
    location: { type: 'Point', coordinates: [72.8777, 19.076] }, // Mumbai
  },
  {
    name: 'Priya Sharma',
    email: 'phlebotomist@test.com',
    password: 'password123',
    role: 'phlebotomist',
    location: { type: 'Point', coordinates: [72.8856, 19.0896] }, // ~2km from patient
  },
  {
    name: 'Dr. Rahul Verma',
    email: process.env.ADMIN_EMAIL || 'labadmin@test.com',
    password: process.env.ADMIN_PASSWORD || 'password123',
    role: 'lab_admin',
    location: { type: 'Point', coordinates: [72.8362, 18.9322] }, // Lab location
  },
];

const seedTests = [
  { testName: 'Complete Blood Count (CBC)', price: 350, fastingHours: 0, sampleType: 'EDTA', description: 'Measures red & white blood cells, hemoglobin, hematocrit, and platelets.', category: 'Hematology' },
  { testName: 'Lipid Profile', price: 600, fastingHours: 12, sampleType: 'Serum', description: 'Checks cholesterol, triglycerides, HDL, LDL, and VLDL levels.', category: 'Cardiology' },
  { testName: 'HbA1c (Glycated Hemoglobin)', price: 500, fastingHours: 0, sampleType: 'EDTA', description: 'Average blood sugar over 2-3 months for diabetes monitoring.', category: 'Diabetes' },
  { testName: 'Thyroid Profile (T3, T4, TSH)', price: 800, fastingHours: 0, sampleType: 'Serum', description: 'Evaluates thyroid gland function and hormone levels.', category: 'Endocrinology' },
  { testName: 'Liver Function Test (LFT)', price: 700, fastingHours: 10, sampleType: 'Serum', description: 'Assesses liver health via bilirubin, ALT, AST, ALP, and protein levels.', category: 'Hepatology' },
  { testName: 'Kidney Function Test (KFT)', price: 650, fastingHours: 8, sampleType: 'Serum', description: 'Measures creatinine, BUN, uric acid, and electrolytes.', category: 'Nephrology' },
  { testName: 'Fasting Blood Sugar (FBS)', price: 150, fastingHours: 8, sampleType: 'Fluoride', description: 'Measures blood glucose after overnight fasting.', category: 'Diabetes' },
  { testName: 'Vitamin D (25-OH)', price: 1200, fastingHours: 0, sampleType: 'Serum', description: 'Checks Vitamin D levels to assess bone health and immunity.', category: 'Nutrition' },
  { testName: 'Vitamin B12', price: 900, fastingHours: 0, sampleType: 'Serum', description: 'Measures B12 levels for nerve function and RBC production.', category: 'Nutrition' },
  { testName: 'Iron Studies', price: 1000, fastingHours: 12, sampleType: 'Serum', description: 'Comprehensive iron panel to diagnose anemia or iron overload.', category: 'Hematology' },
  { testName: 'Coagulation Profile (PT/INR)', price: 450, fastingHours: 0, sampleType: 'Citrate', description: 'Evaluates blood clotting ability.', category: 'Hematology' },
  { testName: 'C-Reactive Protein (CRP)', price: 550, fastingHours: 0, sampleType: 'Serum', description: 'Marker for inflammation and infection in the body.', category: 'Immunology' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await TestCatalog.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed users
    const users = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`👤 Created ${user.role}: ${user.email}`);
    }

    // Seed tests
    const tests = await TestCatalog.insertMany(seedTests);
    console.log(`🧪 Seeded ${tests.length} tests`);

    // Create a sample booking
    const sampleBooking = await Booking.create({
      patient: users[0]._id,
      test: tests[0]._id,
      slot: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      qrCodeToken: uuidv4(),
      patientLocation: users[0].location,
    });
    console.log(`📋 Created sample booking: ${sampleBooking._id}`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Patient:       patient@test.com / password123');
    console.log('Phlebotomist:  phlebotomist@test.com / password123');
    console.log(`Lab Admin:     ${process.env.ADMIN_EMAIL || 'labadmin@test.com'} / [Seeded Password]`);
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
