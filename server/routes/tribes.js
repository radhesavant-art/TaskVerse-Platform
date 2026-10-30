const express = require('express');
const router = express.Router();
const Tribe = require('../models/Tribe');

// Get all tribes
router.get('/', async (req, res) => {
  try {
    const tribes = await Tribe.find();
    res.json(tribes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new tribe
router.post('/create', async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const newTribe = new Tribe({ name, description, category });
    await newTribe.save();
    res.status(201).json(newTribe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;