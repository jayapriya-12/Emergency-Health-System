const emergencySocketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Join user specific room or role room
    socket.on('join_room', (data) => {
      if (data?.userId) {
        socket.join(`user:${data.userId}`);
        console.log(`Socket ${socket.id} joined user room: user:${data.userId}`);
      }
      if (data?.role) {
        socket.join(`role:${data.role}`);
        console.log(`Socket ${socket.id} joined role room: role:${data.role}`);
      }
      if (data?.requestId) {
        socket.join(`request:${data.requestId}`);
        console.log(`Socket ${socket.id} joined request room: request:${data.requestId}`);
      }
    });

    // Driver location update stream
    socket.on('update_driver_location', (data) => {
      // data: { driverId, requestId, latitude, longitude, speed, heading }
      if (data.requestId) {
        io.to(`request:${data.requestId}`).emit('driver_location_changed', data);
      }
      io.to('role:ADMIN').emit('live_driver_location', data);
    });

    // Status changes
    socket.on('update_trip_status', (data) => {
      // data: { requestId, status, driverId, hospitalId, patientId }
      io.to(`request:${data.requestId}`).emit('trip_status_updated', data);
      io.to(`user:${data.patientId}`).emit('emergency_status_changed', data);
      io.to('role:HOSPITAL').emit('hospital_trip_update', data);
      io.to('role:ADMIN').emit('admin_trip_update', data);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = emergencySocketHandler;
