export default function StylizedIslandLayer({ islands, onSelect }) {
  // Give each island its own path and ID so we can match it to backend data later.
  return (
    <g className="smp-islands" fillRule="evenodd">
      {islands.map(island => (
        <path
          key={island.id}
          role="button"
          tabIndex={0}
          aria-label={island.name}
          onClick={event => onSelect(island.id, event.currentTarget.getBBox())}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect(island.id, event.currentTarget.getBBox());
            }
          }}
          data-island-id={island.id}
          className="smp-land"
          d={island.path}
          vectorEffect="non-scaling-stroke"
        >
          <title>{island.name}</title>
        </path>
      ))}
    </g>
  );
}
