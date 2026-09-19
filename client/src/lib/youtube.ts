export const parseYoutubeUrl = (url: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  
  // If user pasted exact 11-character video ID
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  
  // Matches standard youtube.com/watch?v=ID, youtu.be/ID, shorts/ID, embed/ID, music.youtube.com
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};
