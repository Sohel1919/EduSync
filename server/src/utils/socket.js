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