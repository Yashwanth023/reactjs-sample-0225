
import { useState, useEffect } from 'react';

export function useRandomAvatar() {
  const [avatar, setAvatar] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomAvatar = async () => {
      try {
        const randomId = Math.floor(Math.random() * 1000);
        const response = await fetch(`https://picsum.photos/id/${randomId}/info`);
        const data = await response.json();
        setAvatar(data.download_url);
      } catch (error) {
        console.error('Error fetching avatar:', error);
        // Fallback to a default avatar
        setAvatar(`https://picsum.photos/200/200?random=${Math.random()}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomAvatar();
  }, []);

  return { avatar, loading };
}
