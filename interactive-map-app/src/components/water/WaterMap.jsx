import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { defaultIslands } from './data/islands.js';
import IslandPlacement from './placement/IslandPlacement.jsx';
import WaterIsland from './WaterIsland.jsx';
import IslandName from './IslandName.jsx';
import CurrentControls from './CurrentControls.jsx';
import useWaterEngine from './hooks/useWaterEngine.js';
import './WaterMap.css';

function setInitialCamera(world) {
  if (!world) return;

  const scene = world.parentElement;
  const { width, height } = scene.getBoundingClientRect();

  // Match the engine's opening view before the water simulation starts.
  const scale = Math.max(
    0.12,
    Math.min((width - 24) / 1200, (height * 0.6 - 44) / 800)
  );

  world.style.left = `${scene.clientWidth / 2}px`;
  world.style.top = `${(scene.clientHeight * 0.6 - 36) / 2}px`;
  world.style.transform = `scale(${scale}) translate(-600px, -400px)`;
}

const WaterMap = forwardRef(function WaterMap({ onSelect, zoom = 1, islands = defaultIslands,
  initialCurrents, onCurrentsChange, positions, onPositionsChange }, ref) {
  const [highlight, setHighlight] = useState(true);
  const host = useRef(null);
  const { engine, state, actions } = useWaterEngine(host, {
    islands, initialCurrents, onSelect, onCurrentsChange, zoom,
  });
  useImperativeHandle(ref, () => ({
    focusIsland: id => engine.current?.focusIsland(id),
    hideName: () => engine.current?.hideName(),
    getCurrents: () => engine.current?.getCurrents() ?? [],
    // Use after an asynchronous database read; does not trigger the save callback.
    setCurrents: records => engine.current?.setCurrents(records),
  }), [engine]);
  return <div ref={host} data-coast-highlight={highlight} className="water-map-scene" aria-label="Interactive island and water-current map">
    <div className="world" id="world" ref={setInitialCamera}>
      <canvas id="water" width="1200" height="800" aria-hidden="true" />
      {islands.map(island => <WaterIsland key={island.id} island={island} onSelect={actions.focusIsland} />)}
      {islands.map(island => <IslandName key={island.id} island={island} />)}
    </div>
    <CurrentControls state={state} actions={actions}>
      {positions && <IslandPlacement host={host} engine={engine} positions={positions}
        onChange={onPositionsChange} editing={state.editing} />}
      <label><input type="checkbox" checked={highlight}
        onChange={event => setHighlight(event.target.checked)} /> Island highlight</label>
    </CurrentControls>
  </div>;
});
export default WaterMap;
