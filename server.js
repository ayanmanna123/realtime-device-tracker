const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3000;

app.use(express.static('public'));

const devices = {}; // Track all current device locations

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send all current device locations to new user
  socket.emit('initialLocations', devices);

  // When a device sends location
  socket.on('deviceLocation', (data) => {
    const { id, lat, lng, accuracy } = data;
    devices[id] = { lat, lng, accuracy }; // update map
    io.emit('updateLocation', { id, lat, lng, accuracy }); // broadcast to all
  });

  // On disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    delete devices[socket.id];
    io.emit('removeDevice', { id: socket.id });
  });
});

http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
