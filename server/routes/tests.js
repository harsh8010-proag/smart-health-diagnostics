const express = require('express');
const TestCatalog = require('../models/TestCatalog');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/tests — List all tests (public)
router.get('/', async (req, res) => {
  try {
    const tests = await TestCatalog.find().sort({ testName: 1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tests.' });
  }
});

// POST /api/tests/seed — Seed sample tests (dev helper)
router.post('/seed', async (req, res) => {
  try {
    const sampleTests = [
      {
        testName: 'Complete Blood Count (CBC)',
        price: 350,
        fastingHours: 0,
        sampleType: 'EDTA',
        description: 'Measures red & white blood cells, hemoglobin, hematocrit, and platelets.',
        category: 'Hematology',
      },
      {
        testName: 'Lipid Profile',
        price: 600,
        fastingHours: 12,
        sampleType: 'Serum',
        description: 'Checks cholesterol, triglycerides, HDL, LDL, and VLDL levels.',
        category: 'Cardiology',
      },
      {
        testName: 'HbA1c (Glycated Hemoglobin)',
        price: 500,
        fastingHours: 0,
        sampleType: 'EDTA',
        description: 'Average blood sugar over the past 2-3 months for diabetes monitoring.',
        category: 'Diabetes',
      },
      {
        testName: 'Thyroid Profile (T3, T4, TSH)',
        price: 800,
        fastingHours: 0,
        sampleType: 'Serum',
        description: 'Evaluates thyroid gland function and hormone levels.',
        category: 'Endocrinology',
      },
      {
        testName: 'Liver Function Test (LFT)',
        price: 700,
        fastingHours: 10,
        sampleType: 'Serum',
        description: 'Assesses liver health via bilirubin, ALT, AST, ALP, and protein levels.',
        category: 'Hepatology',
      },
      {
        testName: 'Kidney Function Test (KFT)',
        price: 650,
        fastingHours: 8,
        sampleType: 'Serum',
        description: 'Measures creatinine, BUN, uric acid, and electrolytes for kidney health.',
        category: 'Nephrology',
      },
      {
        testName: 'Fasting Blood Sugar (FBS)',
        price: 150,
        fastingHours: 8,
        sampleType: 'Fluoride',
        description: 'Measures blood glucose after overnight fasting.',
        category: 'Diabetes',
      },
      {
        testName: 'Vitamin D (25-OH)',
        price: 1200,
        fastingHours: 0,
        sampleType: 'Serum',
        description: 'Checks Vitamin D levels to assess bone health and immunity.',
        category: 'Nutrition',
      },
      {
        testName: 'Vitamin B12',
        price: 900,
        fastingHours: 0,
        sampleType: 'Serum',
        description: 'Measures B12 levels — important for nerve function and red blood cell production.',
        category: 'Nutrition',
      },
      {
        testName: 'Iron Studies (Serum Iron + TIBC + Ferritin)',
        price: 1000,
        fastingHours: 12,
        sampleType: 'Serum',
        description: 'Comprehensive iron panel to diagnose anemia or iron overload.',
        category: 'Hematology',
      },
      {
        testName: 'Coagulation Profile (PT/INR)',
        price: 450,
        fastingHours: 0,
        sampleType: 'Citrate',
        description: 'Evaluates blood clotting ability — essential for surgery and medication monitoring.',
        category: 'Hematology',
      },
      {
        testName: 'C-Reactive Protein (CRP)',
        price: 550,
        fastingHours: 0,
        sampleType: 'Serum',
        description: 'Marker for inflammation and infection in the body.',
        category: 'Immunology',
      },
    ];

    await TestCatalog.deleteMany({});
    const created = await TestCatalog.insertMany(sampleTests);
    res.json({ message: `Seeded ${created.length} tests.`, tests: created });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: 'Failed to seed tests.' });
  }
});

module.exports = router;
