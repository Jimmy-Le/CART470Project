import { forwardRef, useImperativeHandle, useRef } from 'react';
import { defaultIslands } from './data/islands.js';
import WaterIsland from './WaterIsland.jsx';
import IslandName from './IslandName.jsx';
import CurrentControls from './CurrentControls.jsx';
import useWaterEngine from './hooks/useWaterEngine.js';
import './WaterMap.css';

const WaterMap = forwardRef(function WaterMap({ onSelect, zoom = 1, islands = defaultIslands,
  initialCurrents, onCurrentsChange, storageKey }, ref) {
  const host = useRef(null);
  const { engine, state, actions } = useWaterEngine(host, {
    islands, initialCurrents, onSelect, onCurrentsChange, zoom, storageKey,
  });
  useImperativeHandle(ref, () => ({
    focusIsland: id => engine.current?.focusIsland(id),
    hideName: () => engine.current?.hideName(),
    getCurrents: () => engine.current?.getCurrents() ?? [],
    // Use after an asynchronous database read; does not trigger the save callback.
    setCurrents: records => engine.current?.setCurrents(records),
  }), [engine]);
  return <div ref={host} className="water-map-scene" aria-label="Interactive island and water-current map">
    <div className="world" id="world">
      <canvas id="water" width="1200" height="800" aria-hidden="true" />
      {islands.map(island => <WaterIsland key={island.id} island={island} onSelect={actions.focusIsland} />)}
      {islands.map(island => <IslandName key={island.id} island={island} />)}
    </div>
    <CurrentControls state={state} actions={actions} />
  </div>;
});
export default WaterMap;
