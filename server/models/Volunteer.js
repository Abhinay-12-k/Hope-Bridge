const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    skills: { type: [String], required: true },
    availability: { type: String, required: true },
    remarks: { type: String },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] },
    registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
