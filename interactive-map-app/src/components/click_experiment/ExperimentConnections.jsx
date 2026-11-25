
export default function ExperimentConnections({
    islands,
    selectedIsland,
    connections
}) {
    if (!selectedIsland) return null;

    // Find the selected island's data using its ID.
    const selected = islands.find(
        island => island.id === selectedIsland
    );

    if (!selected) return null;

    //Get the IDs of islands connected to the selected island
    const relatedIds = connections[selectedIsland] ?? [];

    // Calculate island center in world coordinates
    const getCenter = (island) => ({
        x: island.x + island.width / 2,
        y: island.y + island.height / 2
    });

    // The selected island is the starting point of each line.
    const start = getCenter(selected);

    return (
        <svg
            className="experiment-connections"
            viewBox="0 0 1200 800"
            aria-hidden="true"
        >
            {/* Draw one line for each connected island. */}
            {relatedIds.map(id => {
                const target = islands.find(
                    island => island.id === id
                );

                if (!target) return null;

                const end = getCenter(target);

                return (
                    <line
                        key={id}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                    />
                );
            })}
        </svg>
    );
}
