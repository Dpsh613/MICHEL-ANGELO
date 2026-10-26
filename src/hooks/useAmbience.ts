import { useCallback, useEffect, useRef, useState } from "react";

export function useAmbience() {
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const sources = useRef<(AudioBufferSourceNode | OscillatorNode)[]>([]);

  const toggle = useCallback(async () => {
    try {
      if (!context.current) {
        const audio = new AudioContext();
        context.current = audio;
        const gain = audio.createGain();
        gain.gain.value = 0;
        gain.connect(audio.destination);
        master.current = gain;

        // A quiet, locally synthesized room tone. No audio is fetched or autoplayed.
        const buffer = audio.createBuffer(
          1,
          audio.sampleRate * 4,
          audio.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < samples.length; i++) {
          previous = (previous + (Math.random() * 2 - 1) * 0.025) / 1.025;
          samples[i] = previous * 2.8;
        }
        const room = audio.createBufferSource();
        room.buffer = buffer;
        room.loop = true;
        const filter = audio.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 380;
        room.connect(filter);
        filter.connect(gain);
        room.start();
        sources.current.push(room);

        [65.41, 98, 130.81].forEach((frequency, index) => {
          const tone = audio.createOscillator();
          tone.frequency.value = frequency;
          const volume = audio.createGain();
          volume.gain.value = 0.025 / (index + 1);
          tone.connect(volume);
          volume.connect(gain);
          tone.start();
          sources.current.push(tone);
        });
      }
      await context.current.resume();
      const next = !playing;
      const gain = master.current!.gain;
      gain.cancelScheduledValues(context.current.currentTime);
      gain.setTargetAtTime(next ? 0.35 : 0, context.current.currentTime, 0.3);
      setPlaying(next);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
      setPlaying(false);
    }
  }, [playing]);

  useEffect(() => {
    const muteHiddenTab = () => {
      if (!context.current || !master.current) return;
      master.current.gain.setTargetAtTime(
        document.hidden ? 0 : playing ? 0.35 : 0,
        context.current.currentTime,
        0.15,
      );
    };
    document.addEventListener("visibilitychange", muteHiddenTab);
    return () =>
      document.removeEventListener("visibilitychange", muteHiddenTab);
  }, [playing]);

  useEffect(
    () => () => {
      sources.current.forEach((source) => source.stop());
      void context.current?.close();
      context.current = null;
      sources.current = [];
    },
    [],
  );

  return { playing, unavailable, toggle };
}
