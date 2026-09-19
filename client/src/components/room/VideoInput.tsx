import React, { useState } from 'react';
import { Search, Video } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { parseYoutubeUrl } from '../../lib/youtube';

interface VideoInputProps {
  currentVideoId: string | null;
  onChangeVideo: (videoId: string) => void;
  disabled?: boolean;
}

export const VideoInput: React.FC<VideoInputProps> = ({ currentVideoId, onChangeVideo, disabled }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) return;

    const videoId = parseYoutubeUrl(url);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    if (videoId !== currentVideoId) {
      onChangeVideo(videoId);
    }
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Video className="h-4 w-4 text-zinc-500" />
        </div>
        <Input
          type="text"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          className="pl-9"
          error={error}
          disabled={disabled}
        />
      </div>
      <Button type="submit" disabled={disabled || !url.trim()} className={error ? "mt-0 h-10" : ""}>
        <Search className="h-4 w-4 mr-2 hidden sm:block" />
        Change Video
      </Button>
    </form>
  );
};
