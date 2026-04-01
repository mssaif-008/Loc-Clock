import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

export function useAlarmSound() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/alarm.wav'),
        { shouldPlay: false, isLooping: true, volume: 1.0 }
      );
      setSound(sound);
      return sound;
    } catch (err) {
      console.warn('[AUDIO] Failed to load alarm.wav. Ensure the file is a valid audio format:', err);
      return null;
    }
  };

  const playSound = async () => {
    try {
      if (!sound) {
        const loadedSound = await loadSound();
        await loadedSound?.playAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      console.warn('[AUDIO] Playback error:', err);
    }
  };


  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  return { playSound, stopSound, loadSound };
}
