const islands = [
  { id: 'i1', name: 'Ile Deslauriers' },
  { id: 'i2', name: 'Ile Sainte-Helene' },
  { id: 'i3', name: 'Ile Notre-Dame' },
];
export default function IslandList({ activeIsland, onSelect }) {
  return <ul className="team-island-list-items">
    {islands.map(island => <li key={island.id}>
      <button type="button" aria-pressed={activeIsland === island.id}
        onClick={() => onSelect?.(island.id, island.name)}>{island.name}</button>
    </li>)}
  </ul>;
}
