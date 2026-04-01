const express = require('express');
const router = express.Router();
const { getGallery, addImage } = require('../controllers/galleryController');

router.get('/', getGallery);
router.post('/', addImage); // Admin POST for NGO gallery

module.exports = router;
