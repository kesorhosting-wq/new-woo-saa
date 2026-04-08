import WebSocket from 'ws';

// This script simulates a successful payment message from your backend
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to Backend WebSocket');
  const payload = JSON.stringify({
    type: 'payment_success',
    transactionId: 'TEST-SIMULATION-' + Date.now(),
    amount: 10.00,
    email: 'test@kesor.com',
    username: 'Test Gamer'
  });
  ws.send(payload);
  console.log('Success signal sent to frontend:', payload);
  setTimeout(() => process.exit(0), 1000);
});

ws.on('error', (err) => {
  console.error('Error connecting to WebSocket:', err.message);
  console.log('Ensure your backend Node.js server is running on port 8080');
  process.exit(1);
});
