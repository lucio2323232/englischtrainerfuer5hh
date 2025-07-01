
let socket;
let playerName = "";
let roomCode = "";

function showLobby() {
  document.getElementById("lobbyArea").style.display = "block";
}
function joinLobby() {
  playerName = document.getElementById("nameInput").value;
  roomCode = document.getElementById("roomInput").value;
  document.getElementById("gameArea").innerText = "Warte auf Mitspieler...";
  document.getElementById("gameArea").style.display = "block";
  socket = new WebSocket("wss://" + window.location.host);
  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "join", name: playerName, room: roomCode }));
  };
  socket.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "start") {
      document.getElementById("gameArea").innerText = "Frage: " + msg.question;
    }
    if (msg.type === "end") {
      document.getElementById("resultArea").innerText = "🏆 Gewinner: " + msg.winner;
    }
  };
}
function showAdmin() {
  document.getElementById("adminPanel").style.display = "block";
}
function loadDatabase() {
  fetch("/api/data").then(res => res.json()).then(data => {
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";
    data.games.forEach(g => {
      tbody.innerHTML += `<tr><td>${g.player1}</td><td>${g.player2}</td><td>${g.winner}</td></tr>`;
    });
  });
}
