const express = require('express');
const router = express.Router();
const { getProjects, getSingleProject, createProject } = require('../controllers/projectController');

router.get('/', getProjects);
router.get('/:slug', getSingleProject);
router.post('/', createProject); // Simple POST for now

module.exports = router;
