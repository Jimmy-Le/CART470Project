export function FloatingLetter({ character }) {
  return <span className="drift-letter" style={{ textShadow: '0 0 3px #edf0df80' }}>
    {character === ' ' ? '\u00a0' : character}
  </span>;
}

export default function IslandName({ island }) {
  return <div className="sea-name driftwood-name" data-name-for={island.id}
    style={{ left: island.label.x, top: island.label.y, width: island.label.width }} aria-hidden="true">
    {[...island.name].map((character, index) => <FloatingLetter key={index} character={character} />)}
  </div>;
}
