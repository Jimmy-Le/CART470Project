export default function StylizedIslandLayer({ islands, onMontreal }) {
  // Give each island its own path and ID so we can match it to backend data later.
  return (
    <g className="smp-islands" fillRule="evenodd">
      {islands.map(island => (
        <path
          key={island.id}
          {...(island.id === 'montreal' && {
            role: 'button', tabIndex: 0, 'aria-label': island.name,
            onClick: onMontreal,
            onKeyDown: event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onMontreal();
              }
            },
          })}
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
