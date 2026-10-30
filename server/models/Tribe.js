const mongoose = require('mongoose');

const tribeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  membersCount: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Tribe', tribeSchema);