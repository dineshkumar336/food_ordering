const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const checkEnv = require('./config/env');
checkEnv();                       // refuse to start with a missing or weak JWT_SECRET

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimit');

const http = require('http');
const { initSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);

// Behind a reverse proxy, set TRUST_PROXY (e.g. 1) so rate limits see real client IPs.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);
}

// Middleware
// Security headers (nosniff, frameguard, HSTS, ...). Images are loaded by the frontend on another port,
// so cross-origin resource loading stays allowed for them.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50kb' }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limit the API and reject MongoDB operator injection in every request
app.use('/api', apiLimiter);
app.use('/api', sanitize);

connectDB();

// Routes
app.get('/', (req, res) => res.send('FoodOrdering API is running...'));
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
