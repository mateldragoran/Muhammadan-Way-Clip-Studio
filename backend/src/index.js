import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import our API routes
import videoRoutes from './routes/video.routes.js';
import renderRoutes from './routes/render.routes.js';

dotenv.config();

const app = express();

// =========================================
// MIDDLEWARE
// =========================================
app.use(cors()); // Allow frontend to communicate with backend

// Increase JSON payload limit to 500mb for large transcripts and base64 video uploads
app.use(express.json({ limit: '500mb' })); 
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// =========================================
// HEALTH CHECK
// =========================================
app.get('/health', (req, res) => {
  res.json({ status: '✅ Spiritual Clip Studio Backend is running and ready.' });
});

// =========================================
// API ROUTES
// =========================================
app.use('/api/video', videoRoutes);
app.use('/api/render', renderRoutes);

// =========================================
// SERVER INITIALIZATION
// =========================================
const PORT = process.env.PORT || 7676;

app.listen(PORT, () => {
  console.log(`🚀 Backend Engine running on http://localhost:${PORT}`);
  console.log(`⏳ Waiting for FFmpeg rendering jobs...`);
});