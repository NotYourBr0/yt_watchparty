import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './config/database';
import { setupSocket } from './socket';
import { RoomManager } from './services/RoomManager';

const app = express();
app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

const httpServer = createServer(app);
setupSocket(httpServer);

const startServer = async () => {
  await connectDB();
  await RoomManager.loadRoomsFromDB();

  // Stale room cleanup every 10 minutes
  setInterval(() => {
    RoomManager.cleanupStaleRooms();
  }, 10 * 60 * 1000);

  httpServer.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
};

startServer();
