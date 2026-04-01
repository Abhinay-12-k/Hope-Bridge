const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to Database (Optional for Testing)
if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('user:pass')) {
    connectDB();
} else {
    console.log('--- WARNING: MONGO_URI missing or placeholder. Running in Offline Mode (API only) ---');
}

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: "NGO Backend API is running..." });
});

// Routes Registration
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Port Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
