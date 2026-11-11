const islands = [
  { id: 'i1', name: 'Ile Deslauriers' },
  { id: 'i2', name: 'Ile Sainte-Helene' },
  { id: 'i3', name: 'Ile Notre-Dame' },
  { id: 'i4', name: 'Ile Meow'},
  { id: 'i5', name: 'Ile Meow'},
  { id: 'i6', name: 'Ile Meow'},
  { id: 'i7', name: 'Ile Meow'},
  { id: 'i8', name: 'Ile Meow'},
  { id: 'i9', name: 'Ile Meow'},
  { id: 'i10', name: 'Ile Meow'},
  { id: 'i11', name: 'Ile Meow'},
  { id: 'i12', name: 'Ile Meow'},
  { id: 'i13', name: 'Ile Meow'},
  { id: 'i14', name: 'Ile Meow'},
  { id: 'i15', name: 'Ile Meow'}

];
export default function IslandList({ activeIsland, onSelect }) {
  return <ul className="team-island-list-items">
    <h2>List of Islands</h2>
    {islands.map(island => <li key={island.id}>
      <button type="button" aria-pressed={activeIsland === island.id}
        onClick={() => onSelect?.(island.id, island.name)}>{island.name}</button>
    </li>)}
  </ul>;
}
