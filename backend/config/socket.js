const { Server } = require('socket.io');
const { userFromToken } = require('../utils/token');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      // same checks as the HTTP API: valid signature, active account, token not revoked
      const result = await userFromToken(token);
      if (!result || result.scope !== 'full') return next(new Error('Authentication error'));
      const user = result.user;
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user._id} (${socket.id})`);

    // Join room based on user ID
    socket.join(`user_${socket.user._id}`);
    
    // Joint room based on restaurant ID if applicable
    if (socket.user.role === 'restaurant' && socket.user.restaurantId) {
      socket.join(`restaurant_${socket.user.restaurantId}`);
      console.log(`Restaurant room joined: restaurant_${socket.user.restaurantId}`);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit events helpers
const emitToUser = (userId, event, data) => {
  if (io) io.to(`user_${userId}`).emit(event, data);
};

const emitToRestaurant = (restaurantId, event, data) => {
  if (io) io.to(`restaurant_${restaurantId}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToUser, emitToRestaurant };
