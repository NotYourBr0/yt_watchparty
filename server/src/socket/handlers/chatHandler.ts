import { Server, Socket } from 'socket.io';
import { ClientEvents, ServerEvents } from '../../../../shared/events';
import { ChatManager } from '../../services/ChatManager';
import { ReactionType } from '../../../../shared/types';

export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on(ClientEvents.SEND_MESSAGE, (payload: { content: string }) => {
    const { roomCode, userId, username } = socket.data;
    if (!roomCode || !userId) return;

    const msg = ChatManager.createMessage(userId, username, payload.content);
    if (msg) {
      io.to(roomCode).emit(ServerEvents.CHAT_MESSAGE, msg);
    }
  });

  socket.on(ClientEvents.SEND_REACTION, (payload: { type: ReactionType }) => {
    const { roomCode, userId, username } = socket.data;
    if (!roomCode || !userId) return;

    const reaction = ChatManager.createReaction(userId, username, payload.type);
    if (reaction) {
      io.to(roomCode).emit(ServerEvents.REACTION, reaction);
    }
  });
};
