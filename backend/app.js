const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Add this line

// Load environment variables
require('dotenv').config();

// Debug environment variables (optional)
console.log('Environment variables loaded, JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Import routes
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const uploadRoutes = require('./routes/upload-routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// Routes
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'An unknown error occurred!';
  res.status(status).json({ message: message });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });