


export default function IslandList({islands, activeIslandID, onSelect, language='EN' }) {

  return <ul className="team-island-list-items">
    {islands.map(island => <li key={island._id}>
      <button type="button" aria-pressed={activeIslandID === island._id}
        onClick={() => onSelect?.(island._id, island[language].name)}> {island[language].name}</button>
    </li>)}
  </ul>;
}
