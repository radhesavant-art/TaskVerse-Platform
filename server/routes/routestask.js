const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// Get tasks assigned to a specific employee
router.get('/my-tasks/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status (Pending -> In Progress -> Completed)
router.patch('/update-status/:taskId', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId, 
      { status }, 
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;