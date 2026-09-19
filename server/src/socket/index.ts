import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerRoomHandlers } from './handlers/roomHandler';
import { registerPlaybackHandlers } from './handlers/playbackHandler';
import { registerParticipantHandlers } from './handlers/participantHandler';
import { registerRequestHandlers } from './handlers/requestHandler';
import { registerChatHandlers } from './handlers/chatHandler';
import { config } from '../config';

export const setupSocket = (httpServer: HttpServer) => {
  const allowedOrigins = config.clientUrl === '*' 
    ? '*' 
    : config.clientUrl.includes(',') 
      ? config.clientUrl.split(',').map(s => s.trim()) 
      : config.clientUrl;

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerPlaybackHandlers(io, socket);
    registerParticipantHandlers(io, socket);
    registerRequestHandlers(io, socket);
    registerChatHandlers(io, socket);
  });

  return io;
};
