import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import blueIsland from '../../assets/blue.png';
import gullSound from '../../assets/audio/seagulls.mp3';
import template from './waterMap.html?raw';
import { createWaterMap } from './waterEngine.js';
import './WaterMap.css';

const WaterMap = forwardRef(function WaterMap({ onSelect, zoom }, ref) {
  const host = useRef(null);
  const engine = useRef(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useImperativeHandle(ref, () => ({
    focusIsland: () => engine.current?.focusIsland(),
    hideName: () => engine.current?.hideName(),
  }), []);

  useEffect(() => {
    const root = host.current;
    root.innerHTML = template.replace('__BLUE_ISLAND__', blueIsland);
    const map = createWaterMap(root, { onSelect: () => onSelectRef.current?.() });
    engine.current = map;
    const audio = new Audio(gullSound);
    audio.loop = true;
    const abort = new AbortController();
    const stop = () => { audio.pause(); audio.currentTime = 0; };
    const island = root.querySelector('.island');
    island.addEventListener('mouseenter', () => {
      // Browsers may require a first user interaction before allowing audio.
      audio.play().catch(() => {});
    }, { signal: abort.signal });
    island.addEventListener('mouseleave', stop, { signal: abort.signal });
    return () => {
      abort.abort();
      stop();
      audio.removeAttribute('src');
      map.destroy();
      engine.current = null;
      root.replaceChildren();
    };
  }, []);

  useEffect(() => { engine.current?.setZoom(zoom); }, [zoom]);
  return <div ref={host} className="water-map-scene" aria-label="Interactive island and water-current map" />;
});
export default WaterMap;
