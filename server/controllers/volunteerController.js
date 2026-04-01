const Volunteer = require('../models/Volunteer');

// @desc Register volunteer
// @route POST /api/volunteers
exports.registerVolunteer = async (req, res) => {
    try {
        const { fullName, email, phone, skills, availability, remarks } = req.body;
        
        // Basic unique email check
        const existing = await Volunteer.findOne({ email });
        if (existing) return res.status(400).json({ success: false, error: 'Email already registered.' });

        const volunteer = await Volunteer.create({ fullName, email, phone, skills, availability, remarks });
        res.status(201).json({ success: true, data: volunteer, message: "Thank you for your interest! We'll contact you soon." });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc Get all (Admin)
// @route GET /api/volunteers
exports.getVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ registeredAt: -1 });
        res.status(200).json({ success: true, count: volunteers.length, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
