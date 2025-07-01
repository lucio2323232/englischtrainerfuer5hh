const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const fs = require('fs');

app.use(express.static('public'));

let rooms = {};

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        let data = JSON.parse(message);

        if (data.type === 'create_room') {
            let roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
            rooms[roomCode] = [ws];
            ws.roomCode = roomCode;
            ws.send(JSON.stringify({ type: 'room_created', code: roomCode }));
        }

        if (data.type === 'join_room') {
            let room = rooms[data.code];
            if (room && room.length === 1) {
                room.push(ws);
