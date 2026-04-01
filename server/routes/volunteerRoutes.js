const express = require('express');
const router = express.Router();
const { registerVolunteer, getVolunteers } = require('../controllers/volunteerController');

router.post('/', registerVolunteer);
router.get('/', getVolunteers); // Admin only usually, but simple list for now

module.exports = router;
