const Project = require('../models/Project');

// @desc Get all projects
// @route GET /api/projects
exports.getProjects = async (req, res) => {
    try {
        const { featured, limit } = req.query;
        let query = {};
        if (featured === 'true') query.featured = true;
        
        const projects = await Project.find(query).limit(limit ? parseInt(limit) : 0).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc Get single project by slug
// @route GET /api/projects/:slug
exports.getSingleProject = async (req, res) => {
    try {
        const project = await Project.findOne({ slug: req.params.slug });
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc Create project (Admin)
// @route POST /api/projects
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
