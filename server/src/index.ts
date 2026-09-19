import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './config/database';
import { setupSocket } from './socket';
import { RoomManager } from './services/RoomManager';

const app = express();

const allowedOrigins = config.clientUrl === '*' 
  ? '*' 
  : config.clientUrl.includes(',') 
    ? config.clientUrl.split(',').map(s => s.trim()) 
    : config.clientUrl;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Health check endpoints for Render / Monitoring
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'YT Watch Party backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = createServer(app);
setupSocket(httpServer);

const startServer = async () => {
  await connectDB();
  await RoomManager.loadRoomsFromDB();

  // Stale room cleanup every 10 minutes
  setInterval(() => {
    RoomManager.cleanupStaleRooms();
  }, 10 * 60 * 1000);

  const port = Number(process.env.PORT) || 3001;
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
  });
};

startServer();
