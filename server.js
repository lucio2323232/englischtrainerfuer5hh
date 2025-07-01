
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
