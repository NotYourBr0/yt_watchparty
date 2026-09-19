import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlaySquare, ArrowRight, Plus } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const joinRoomCode = (location.state as any)?.joinRoomCode || '';

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(joinRoomCode);
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a display name');
      return;
    }

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newCode}`, { state: { username: name.trim() } });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a display name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    navigate(`/room/${roomCode.trim().toUpperCase()}`, { state: { username: name.trim() } });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
            <PlaySquare className="h-7 w-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Watch Party</h1>
          <p className="text-zinc-400">Watch together. Synchronized playback. Real-time rooms.</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          <div className="mb-5">
            <Input
              label="Display Name"
              placeholder="How should others see you?"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              error={error && !name.trim() ? error : undefined}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Room
            </Button>

            <div className="relative py-3 flex items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink-0 px-4 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                or join existing
              </span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                error={error && name.trim() && !roomCode.trim() ? error : undefined}
                className="font-mono text-center uppercase tracking-widest"
                maxLength={8}
              />
              <Button variant="secondary" onClick={handleJoin} disabled={!roomCode.trim()} className="shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {joinRoomCode && (
              <p className="text-xs text-indigo-400 text-center mt-2">
                Enter your name to join room {joinRoomCode}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          No account required. Just pick a name and go.
        </p>
      </div>
    </div>
  );
};
