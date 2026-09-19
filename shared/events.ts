// Centralized Socket.IO event names
// Client → Server events
export const ClientEvents = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  RECONNECT_SESSION: 'reconnect_session',
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  CHANGE_VIDEO: 'change_video',
  ASSIGN_ROLE: 'assign_role',
  REMOVE_PARTICIPANT: 'remove_participant',
  TRANSFER_HOST: 'transfer_host',
  REQUEST_PLAY: 'request_play',
  REQUEST_PAUSE: 'request_pause',
  REQUEST_SEEK: 'request_seek',
  REQUEST_VIDEO: 'request_video',
  APPROVE_REQUEST: 'approve_request',
  REJECT_REQUEST: 'reject_request',
  SEND_MESSAGE: 'send_message',
  SEND_REACTION: 'send_reaction',
} as const;

// Server → Client events
export const ServerEvents = {
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ROOM_STATE: 'room_state',
  PLAYBACK_CHANGED: 'playback_changed',
  VIDEO_CHANGED: 'video_changed',
  ROLE_UPDATED: 'role_updated',
  PARTICIPANT_REMOVED: 'participant_removed',
  HOST_TRANSFERRED: 'host_transferred',
  PLAYBACK_REQUEST: 'playback_request',
  REQUEST_UPDATED: 'request_updated',
  CHAT_MESSAGE: 'chat_message',
  REACTION: 'reaction',
  ROOM_ERROR: 'room_error',
  RECONNECT_SUCCESS: 'reconnect_success',
  RECONNECT_FAILED: 'reconnect_failed',
} as const;
