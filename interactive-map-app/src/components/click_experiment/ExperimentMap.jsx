
//add useState in the import
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { defaultIslands } from './data/islands.js';
import ExperimentIsland from './ExperimentIsland.jsx';
import IslandName from '../water/IslandName.jsx';
import CurrentControls from '../water/CurrentControls.jsx';
import useExperimentEngine from './hooks/useExperimentEngine.js';

//import ExperimentConnections
import ExperimentConnections from './ExperimentConnections.jsx';

//change css file name to ExperimentMap.css
import './ExperimentMap.css';

/* --------------new add codes------------------- */

//island mapping
const islandConnections = {
    i1: ['i2', 'i3'],
    i2: ['i1', 'i4'],
    i3: ['i1', 'i5'],
    i4: ['i2'],
    i5: ['i3'],
};

/* --------------------------------- */

// copy from original files
const ExperimentMap = forwardRef(function ExperimentMap({
    onSelect,
    zoom = 1,
    islands = defaultIslands,
    initialCurrents,
    onCurrentsChange
}, ref) {

    const host = useRef(null);

    //save selected island ID
    const [selectedIsland, setSelectedIsland] = useState(null);
    //console.log('React render, selectedIsland:', selectedIsland);

    //I change the name to useExperimentEngine
    const { engine, state, actions } = useExperimentEngine(host, {
        islands,
        initialCurrents,
        onSelect,
        onCurrentsChange,
        zoom,
    });

    //add handleIslandCLick function
    const handleIslandClick = (id) => {

        //debug
        // console.log('Clicked island:', id);

        setSelectedIsland(id);

        //console.log('Related islands:', islandConnections[id]);

        //use original focusIsland function
        actions.focusIsland(id);
    };

    useImperativeHandle(ref, () => ({
        focusIsland: id => engine.current?.focusIsland(id),
        hideName: () => engine.current?.hideName(),
        getCurrents: () => engine.current?.getCurrents() ?? [],
        setCurrents: records => engine.current?.setCurrents(records),
    }), [engine]);

    return (
        <div
            ref={host}
            className="water-map-scene"
            aria-label="Interactive island and water-current map"
        >
            <div className="world" id="world">

                <canvas
                    id="water"
                    width="1200"
                    height="800"
                    aria-hidden="true"
                />

                {/* Draw connections for the currently selected island */}
                <ExperimentConnections
                    islands={islands}
                    selectedIsland={selectedIsland}
                    connections={islandConnections}
                />

                {/* Identify selected and related islands */}
                {islands.map(island => {
                    // Is this the currently selected island?
                    const isFocused = selectedIsland === island.id;

                    // Is this island connected to the selected island?
                    const isRelated = selectedIsland !== null &&
                        (islandConnections[selectedIsland] ?? [])
                            .includes(island.id);

                    // Dim islands that are neither selected nor connected
                    const isDimmed = selectedIsland !== null &&
                        !isFocused &&
                        !isRelated;

                    //debug
                    // console.log(
                    //     island.id,
                    //     'focused:', isFocused,
                    //     'dimmed:', isDimmed
                    // );

                    return (
                        <ExperimentIsland
                            key={island.id}
                            island={island}
                            onSelect={handleIslandClick}
                            isFocused={isFocused}
                            isDimmed={isDimmed}
                        />
                    );
                })}

                {islands.map(island => (
                    <IslandName
                        key={island.id}
                        island={island}
                    />
                ))}

            </div>

            <CurrentControls
                state={state}
                actions={actions}
            />
        </div>
    );
});

export default ExperimentMap;
