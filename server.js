const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// Vokabel-Datenbank laden
const vocabData = JSON.parse(fs.readFileSync('database.json', 'utf8'));

// Multiplayer Räume
let rooms = {};

// WebSocket Verbindung
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error('Invalid JSON:', message);
      return;
    }

    if (data.type === 'createRoom') {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      rooms[roomCode] = { players: [ws] };
      ws.send(JSON.stringify({ type: 'roomCreated', roomCode }));
    }

    else if (data.type === 'joinRoom') {
      const room = rooms[data.roomCode];
      if (room && room.players.length === 1) {
        room.players.push(ws);
        room.players.forEach(player => {
          player.send(JSON.stringify({ type: 'playerJoined', roomCode: data.roomCode }));
        });
      } else {
