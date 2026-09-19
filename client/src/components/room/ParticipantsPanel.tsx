import React from 'react';
import { Participant, Role } from '@shared/types';
import { ParticipantRow } from './ParticipantRow';

interface ParticipantsPanelProps {
  participants: Participant[];
  currentUserRole: Role;
  onPromote: (userId: string) => void;
  onDemote: (userId: string) => void;
  onRemove: (userId: string) => void;
  onTransferHost: (userId: string) => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  currentUserRole,
  onPromote,
  onDemote,
  onRemove,
  onTransferHost,
}) => {
  // Sort: Host first, then Mods, then Participants. Then by connection status, then alphabet.
  const sortedParticipants = [...participants].sort((a, b) => {
    const roleWeight = { [Role.HOST]: 0, [Role.MODERATOR]: 1, [Role.PARTICIPANT]: 2 };
    if (roleWeight[a.role] !== roleWeight[b.role]) return roleWeight[a.role] - roleWeight[b.role];
    if (a.connected !== b.connected) return a.connected ? -1 : 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2 gap-1 custom-scrollbar">
      {sortedParticipants.map((p) => (
        <ParticipantRow
          key={p.userId}
          participant={p}
          currentUserRole={currentUserRole}
          onPromote={onPromote}
          onDemote={onDemote}
          onRemove={onRemove}
          onTransferHost={onTransferHost}
        />
      ))}
    </div>
  );
};
