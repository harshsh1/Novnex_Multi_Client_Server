const net = require('net');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const clients = [];

const server = net.createServer(socket => {
  socket.setEncoding('utf-8');

  // Function to broadcast message to all clients
  function broadcast(sender, message, sentimentScore) {
    const formattedMessage = `[${sender}] ${message} (Sentiment: ${sentimentScore})\n`;
    clients.forEach(client => {
      if (client !== socket) {
        try {
          client.write(formattedMessage);
        } catch (error) {
          console.error(`Error sending message to client: ${error.message}`);
          removeClient(client); // Remove disconnected client
        }
      }
    });
  }

  // Handle regular messages from clients
  function handleMessage(socket, message) {
    const sentimentResult = sentiment.analyze(message);
    broadcast(socket.username, message, sentimentResult.score);
  }

  // Handle username change command
  function handleUsernameChange(socket, message) {
    const newUsername = message.split(' ')[1];
    socket.username = newUsername;
    socket.write(`Your username has been changed to: ${newUsername}\n`);
  }

  // Send list of connected users
  function sendUserList(socket) {
    const usernames = clients.map(client => client.username);
    socket.write('Connected users: ' + usernames.join(', ') + '\n');
  }

  // Remove client from list of connected clients
  function removeClient(socket) {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  }

  // Handle socket errors
  socket.on('error', err => {
    console.error('Socket error:', err.message);
    removeClient(socket);
  });

  // Handle socket close event
  socket.on('close', () => {
    console.log('A client has left the chat.');
    removeClient(socket);
  });

  // Handle incoming data
  socket.on('data', data => {
    const message = data.trim();

    if (message.startsWith('/username')) {
      handleUsernameChange(socket, message);
    } else if (message === '/list') {
      sendUserList(socket);
    } else if (message === '/quit') {
      socket.end();
    } else {
      handleMessage(socket, message);
    }
  });

  // Add client to list of connected clients
  clients.push(socket);
  console.log('Client connected');
});

server.listen(1235, () => {
  console.log('Server is listening on port 1235');
});

