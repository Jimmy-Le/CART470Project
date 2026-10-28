import { useEffect, useRef } from 'react';

// One reusable island: geometry, image, audio and identity come from its record.
export default function WaterIsland({ island, onSelect }) {
  const audio = useRef(null);
  useEffect(() => {
    if (!island.audio) return;
    const sound = new Audio(island.audio);
    sound.loop = true;
    audio.current = sound;
    return () => {
      sound.pause();
      sound.removeAttribute('src');
      sound.load();
      audio.current = null;
    };
  }, [island.audio]);
  const play = () => audio.current?.play().catch(() => {});
  const stop = () => {
    if (audio.current) { audio.current.pause(); audio.current.currentTime = 0; }
  };
  return <button type="button" className="island" data-island={island.id}
    style={{ left: island.x, top: island.y, width: island.width, height: island.height }}
    aria-label={`${island.name} — show island information`} aria-pressed="false"
    onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop}
    onClick={event => { event.stopPropagation(); onSelect(island.id); }}>
    <svg viewBox={island.viewBox} aria-hidden="true"><path className="land" d={island.coast} /></svg>
    <img className="team-island-image" src={island.image} alt="" draggable="false" />
  </button>;
}
