import { sanitizeText } from '../utils/helpers';
import { ChatMessage, Reaction, ReactionType } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

class ChatManagerService {
  private lastMessageTimes: Map<string, number> = new Map();
  private lastReactionTimes: Map<string, number> = new Map();

  createMessage(userId: string, username: string, content: string): ChatMessage | null {
    const now = Date.now();
    const lastTime = this.lastMessageTimes.get(userId) || 0;
    if (now - lastTime < 1000) return null; // rate limit 1s
    
    this.lastMessageTimes.set(userId, now);
    const sanitized = sanitizeText(content, 500);
    if (!sanitized) return null;

    return {
      id: uuidv4(),
      userId,
      username,
      content: sanitized,
      timestamp: new Date().toISOString(),
    };
  }

  createReaction(userId: string, username: string, type: ReactionType): Reaction | null {
    const now = Date.now();
    const lastTime = this.lastReactionTimes.get(userId) || 0;
    if (now - lastTime < 2000) return null; // rate limit 2s

    this.lastReactionTimes.set(userId, now);
    return {
      id: uuidv4(),
      userId,
      username,
      type,
      timestamp: new Date().toISOString(),
    };
  }
}

export const ChatManager = new ChatManagerService();
