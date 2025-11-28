import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room for notifications
    socket.on('join-user-room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room: user_${userId}`);
    });

    // Join admin room for admin notifications
    socket.on('join-admin-room', () => {
      socket.join('admin_room');
      console.log(`User ${socket.id} joined admin room`);
    });

    // Join donation room for real-time donation updates
    socket.on('join-donation-room', (userId) => {
      socket.join(`donation_${userId}`);
      console.log(`User ${userId} joined donation room`);
    });

    // Join admin donation room for admin donation notifications
    socket.on('join-admin-donation-room', () => {
      socket.join('admin_donation_room');
      console.log(`User ${socket.id} joined admin donation room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitNotification = (userId, notification) => {
  const io = getIO();
  io.to(`user_${userId}`).emit('new-notification', notification);
};

export const emitNotificationToAll = (notification) => {
  const io = getIO();
  io.emit('new-notification', notification);
};

export const emitNotificationToAdmins = (notification) => {
  const io = getIO();
  io.to('admin_room').emit('new-notification', notification);
};

// @desc    Emit donation received event to admin room
// @route   Internal
// @access  Private
export const emitDonationReceived = (donationData) => {
  const io = getIO();
  io.to('admin_donation_room').emit('donation_received', donationData);
};

// @desc    Emit donation confirmation to user
// @route   Internal
// @access  Private
export const emitDonationConfirmation = (userId, donationData) => {
  const io = getIO();
  io.to(`donation_${userId}`).emit('donation_confirmed', donationData);
};

// @desc    Emit donation statistics update to all admins
// @route   Internal
// @access  Private
export const emitDonationStatsUpdate = (stats) => {
  const io = getIO();
  io.to('admin_donation_room').emit('donation_stats_updated', stats);
};