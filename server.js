const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
// Import Routes
const driverRoutes = require('./routes/drivers');
const riderRoutes = require('./routes/riders');
const messagesRoute = require('./routes/messages');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Apply authentication middleware globally
app.use(authMiddleware);

// Routes

app.use('/drivers', driverRoutes); // Fixed the variable name here
app.use('/riders', riderRoutes);
app.use('/api/messages', messagesRoute);

// 404 Handler (for routes not matched)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });

// Global error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: err.message 
    });
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dorycar', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));