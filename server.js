const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// 1. Import Database & Models
const { initDB } = require('./models'); // Imports index.js from models

// 2. Import Your Routes
const apiRoutes = require('./routes/apiRoutes'); // <--- IMPORTED HERE
const swaggerSpec = require('./docs/swagger');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Serve Static files (for accessing uploaded photos later if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Mount Routes
// This prefixes all routes in that file with '/api'
// Example: The route '/apply' becomes 'localhost:5000/api/apply'
app.use('/api', apiRoutes);  // <--- MOUNTED HERE

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

// Global Error Handler (Catches Multer File Size Errors)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 1MB.' });
        }
    }
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

// Start Server
const startServer = async () => {
    try {
        // Sync Database (Sequelize)
        await initDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                const fallbackPort = PORT + 1;
                console.warn(`Port ${PORT} in use. Retrying on ${fallbackPort}...`);
                app.listen(fallbackPort, () => {
                    console.log(`Server running on fallback port ${fallbackPort}`);
                });
                return;
            }
            console.error('Server failed to start:', err);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();