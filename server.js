
const express = require("express");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));
app.use(express.json());

let db = require("./database.json");
let rooms = {};

app.get("/api/data", (req, res) => res.json(db));

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.type === "join") {
      if (!rooms[msg.room]) rooms[msg.room] = [];
      rooms[msg.room].push({ socket: ws, name: msg.name });
      if (rooms[msg.room].length === 2) {
        const [a, b] = rooms[msg.room];
        const question = "What is the meaning of 'environment'?";
        a.socket.send(JSON.stringify({ type: "start", question }));
        b.socket.send(JSON.stringify({ type: "start", question }));
        setTimeout(() => {
          const winner = Math.random() > 0.5 ? a.name : b.name;
          a.socket.send(JSON.stringify({ type: "end", winner }));
          b.socket.send(JSON.stringify({ type: "end", winner }));
          db.games.push({ player1: a.name, player2: b.name, winner });
          fs.writeFileSync("database.json", JSON.stringify(db, null, 2));
        }, 3000);
      }
    }
  });
});

server.listen(process.env.PORT || 3000, () => console.log("Server ready"));

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    if (data.type === 'createRoom') {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      rooms[roomCode] = [ws];
      ws.roomCode = roomCode;
      ws.send(JSON.stringify({ type: 'roomCreated', roomCode }));
    } else if (data.type === 'joinRoom') {
      const roomCode = data.roomCode;
      if (rooms[roomCode]) {
        rooms[roomCode].push(ws);
        ws.roomCode = roomCode;
        rooms[roomCode].forEach(client => {
          client.send(JSON.stringify({ type: 'startGame', message: 'Both players joined!' }));
        });
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      }
    } else if (data.type === 'answer') {
      const roomCode = ws.roomCode;
      if (rooms[roomCode]) {
        rooms[roomCode].forEach(client => {
          if (client !== ws) {
            client.send(JSON.stringify({ type: 'opponentAnswer', answer: data.answer }));
          }
        });
      }
    }
  });

  ws.on('close', function() {
    const roomCode = ws.roomCode;
    if (roomCode && rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter(client => client !== ws);
      if (rooms[roomCode].length === 0) {
        delete rooms[roomCode];
      }
    }
  });
});
