const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

let users = [{ username: 'admin', password: 'admin' }];

let servers = [
  { id: 1, load: 0 },
  { id: 2, load: 0 },
  { id: 3, load: 0 }
];

let pointer = 0;

function roundRobin() {
  const s = servers[pointer];
  pointer = (pointer + 1) % servers.length;
  return s;
}

function leastConnections() {
  return servers.reduce((a, b) => (a.load < b.load ? a : b));
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  res.json({ success: !!user });
});

app.post('/request', (req, res) => {
  const { strategy } = req.body;
  let server = strategy === 'round' ? roundRobin() : leastConnections();

  server.load++;
  setTimeout(() => server.load--, 3000);

  io.emit('update', servers);
  res.json({ servers });
});

io.on('connection', (socket) => {
  socket.emit('update', servers);
});

server.listen(5000, () => console.log('Server running on port 5000'));
