export default function StylizedWaterLayer({ paths }) {
  // Each path is a water shape. Evenodd keeps the holes in the water open.
  return (
    <g className="smp-water" fillRule="evenodd" aria-hidden="true">
      {paths.map((path, index) => (
        <path key={index} d={path} className="smp-water-base" />
      ))}
    </g>
  );
}
