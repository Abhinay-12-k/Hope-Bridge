const Contact = require('../models/Contact');

// @desc Submit contact form
// @route POST /api/contacts
exports.submitContact = async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;
        const contact = await Contact.create({ fullName, email, subject, message });
        res.status(201).json({ success: true, data: contact, message: 'Message sent successfully. We will get back to you shortly.' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc Get all (Admin)
// @route GET /api/contacts
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: contacts.length, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
