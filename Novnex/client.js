const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new net.Socket();

rl.question('Enter a username to join the chat: ', username => {
  client.connect(1235, 'localhost', () => {
    console.log('Connected to server');
    client.write(`/username ${username}`);
  });

  // Handle incoming data from server
  client.on('data', data => {
    console.log(data.toString());
  });

  // Handle user input
  rl.on('line', input => {
    if (input.trim() === '/quit') {
      client.end();
      rl.close();
    } else if (input.trim() === '/list') {
      client.write('/list');
    } else {
      client.write(input);
    }
  });

  // Handle connection close event
  client.on('close', () => {
    console.log('Connection closed');
    process.exit(0);
  });

  // Handle socket errors
  client.on('error', err => {
    console.error('Error:', err.message);
    // Attempt to reconnect automatically (optional)
    // client.connect(1235, 'localhost');
  });
});
