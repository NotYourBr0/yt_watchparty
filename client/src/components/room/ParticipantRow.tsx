import React from 'react';
import { Shield, ShieldAlert, Star, MoreVertical } from 'lucide-react';
import { Participant, Role } from '@shared/types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ContextMenu } from '../ui/ContextMenu';

interface ParticipantRowProps {
  participant: Participant;
  currentUserRole: Role;
  onPromote?: (userId: string) => void;
  onDemote?: (userId: string) => void;
  onRemove?: (userId: string) => void;
  onTransferHost?: (userId: string) => void;
}

export const ParticipantRow: React.FC<ParticipantRowProps> = ({
  participant,
  currentUserRole,
  onPromote,
  onDemote,
  onRemove,
  onTransferHost,
}) => {
  const isHost = currentUserRole === Role.HOST;
  const isTargetHost = participant.role === Role.HOST;

  const menuItems = [];

  if (isHost && !isTargetHost) {
    if (participant.role === Role.PARTICIPANT) {
      menuItems.push({
        label: 'Promote to Mod',
        icon: <Shield className="h-4 w-4" />,
        onClick: () => onPromote?.(participant.userId),
      });
    } else if (participant.role === Role.MODERATOR) {
      menuItems.push({
        label: 'Demote to Participant',
        icon: <ShieldAlert className="h-4 w-4" />,
        onClick: () => onDemote?.(participant.userId),
      });
    }

    menuItems.push({
      label: 'Transfer Host',
      icon: <Star className="h-4 w-4 text-amber-500" />,
      onClick: () => onTransferHost?.(participant.userId),
    });

    menuItems.push({
      label: 'Remove from Room',
      danger: true,
      onClick: () => onRemove?.(participant.userId),
    });
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative">
          <Avatar username={participant.username} size="sm" />
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 ${participant.connected ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-zinc-200 truncate">{participant.username}</span>
          <Badge role={participant.role} className="w-fit scale-90 origin-left" />
        </div>
      </div>
      
      {menuItems.length > 0 && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ContextMenu items={menuItems} />
        </div>
      )}
    </div>
  );
};
