const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => socket.join(roomId));
  socket.on('send_message', (data) => io.to(data.roomId).emit('receive_message', data));
});

server.listen(3000, () => console.log("WebSocket server running on port 3000"));
