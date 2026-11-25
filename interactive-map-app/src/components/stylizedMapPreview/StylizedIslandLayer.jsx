export default function StylizedIslandLayer({ islands, selectedId, onFocus, ids }) {
  return <g className="smp-islands" fillRule="evenodd">
    {islands.map((island, index) => <g key={island.id} className="smp-island-art">
      <defs><clipPath id={`${ids.islandClip}-${index}`}>
        <path d={island.path} clipRule="evenodd" />
      </clipPath></defs>
      <path className="smp-land"
      data-island-id={island.id} data-selected={selectedId === island.id}
      d={island.path} role="button" tabIndex={0} aria-label={`Focus ${island.name}`}
      aria-pressed={selectedId === island.id} vectorEffect="non-scaling-stroke"
      // Stop the browser from drawing a box when we click an island.
      onPointerDown={event => event.preventDefault()}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onFocus(island.id); }
      }}>
      <title>{island.name}</title>
      </path>
      <g className="smp-decoration smp-land-washes" clipPath={`url(#${ids.islandClip}-${index})`} aria-hidden="true">
        {island.washes.map((wash, i) => <path key={i} d={wash.path}
          className={`smp-land-patch smp-land-patch-${wash.tone}`} />)}
        <path className="smp-coast-inner" d={island.path} fill="none" vectorEffect="non-scaling-stroke" />
      </g>
    </g>)}
  </g>;
}
