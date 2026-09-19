import React from 'react';
import { ReactionType } from '@shared/types';

interface ReactionPickerProps {
  onReact: (type: ReactionType) => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onReact }) => {
  const reactions: ReactionType[] = ['👍', '❤️', '😂', '👏', '🔥'];

  return (
    <div className="flex items-center gap-1 p-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-lg">
      {reactions.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-800 hover:scale-110 transition-all text-lg"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
