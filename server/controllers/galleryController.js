const Gallery = require('../models/Gallery');

// @desc Get all gallery images
// @route GET /api/gallery
exports.getGallery = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All') query.category = category;
        
        const images = await Gallery.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: images.length, data: images });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc Add image to gallery (Admin)
// @route POST /api/gallery
exports.addImage = async (req, res) => {
    try {
        const image = await Gallery.create(req.body);
        res.status(201).json({ success: true, data: image });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
