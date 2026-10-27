import { useEffect, useRef, useState } from 'react';
import { createWaterMap } from '../waterEngine.js';
import { DEFAULT_STORAGE_KEY, loadLocalCurrents, saveLocalCurrents } from '../data/currentStorage.js';

export default function useWaterEngine(host, { islands, initialCurrents, storageKey = DEFAULT_STORAGE_KEY,
  onSelect, onCurrentsChange, zoom = 1 }) {
  const engine = useRef(null);
  const callbacks = useRef({ onSelect, onCurrentsChange });
  const initial = useRef(initialCurrents);
  const currentZoom = useRef(zoom);
  const [state, setState] = useState({ routes: [], selected: -1, editing: false,
    paused: false, status: 'Add a current, then choose two points in the water.' });
  useEffect(() => { callbacks.current = { onSelect, onCurrentsChange }; }, [onSelect, onCurrentsChange]);
  useEffect(() => { currentZoom.current = zoom; engine.current?.setZoom(zoom); }, [zoom]);
  useEffect(() => {
    const map = createWaterMap(host.current, {
      islands,
      currents: initial.current ?? loadLocalCurrents(storageKey),
      onSelect: (...args) => callbacks.current.onSelect?.(...args),
      onStateChange: setState,
      onCurrentsChange: records => {
        saveLocalCurrents(records, storageKey);
        callbacks.current.onCurrentsChange?.(records);
      },
    });
    engine.current = map;
    map.setZoom(currentZoom.current);
    return () => { map.destroy(); engine.current = null; };
  }, [host, islands, storageKey]);
  const call = name => (...args) => engine.current?.[name](...args);
  return { engine, state, actions: {
    toggleAdd: call('toggleAdd'), overview: call('overview'), togglePause: call('togglePause'),
    selectCurrent: call('selectCurrent'), updateCurrent: call('updateCurrent'),
    reverseCurrent: call('reverseCurrent'), deleteCurrent: call('deleteCurrent'),
    focusIsland: call('focusIsland'),
  } };
}
