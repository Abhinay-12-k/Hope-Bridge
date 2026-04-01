const express = require('express');
const router = express.Router();
const { submitContact, getContacts } = require('../controllers/contactController');

router.post('/', submitContact);
router.get('/', getContacts); // Admin route for message history

module.exports = router;
