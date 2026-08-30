const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a booking-specific room
    socket.on('JOIN_ROOM', ({ bookingId }) => {
      const room = `booking_${bookingId}`;
      socket.join(room);
      console.log(`📌 ${socket.id} joined room: ${room}`);
    });

    // Leave a booking room
    socket.on('LEAVE_ROOM', ({ bookingId }) => {
      const room = `booking_${bookingId}`;
      socket.leave(room);
      console.log(`📌 ${socket.id} left room: ${room}`);
    });

    // Phlebotomist broadcasts live location
    socket.on('PHLEBOTOMIST_LOCATION', ({ bookingId, lat, lng }) => {
      const room = `booking_${bookingId}`;
      io.to(room).emit('PHLEBOTOMIST_LOCATION', { bookingId, lat, lng });
    });

    // Generic status change (can be emitted from client if needed)
    socket.on('STATUS_UPDATE', ({ bookingId, status }) => {
      const room = `booking_${bookingId}`;
      io.to(room).emit('STATUS_CHANGED', { bookingId, status });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
