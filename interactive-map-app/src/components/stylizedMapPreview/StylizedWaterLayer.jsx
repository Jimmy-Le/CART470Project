export default function StylizedWaterLayer({ paths, ids, washes }) {
  return <g className="smp-water" fillRule="evenodd">
    {paths.map((path, index) => <path key={index} d={path} className="smp-water-base" />)}
    <g className="smp-decoration" clipPath={`url(#${ids.waterClip})`} aria-hidden="true">
      {washes.map((wash, index) => <path key={index} d={wash.path} className={`smp-water-patch smp-water-patch-${wash.tone}`} />)}
      <g className="smp-water-shore-inner">
        {paths.map((path, index) => <path key={index} d={path} fill="none" vectorEffect="non-scaling-stroke" />)}
      </g>
    </g>
  </g>;
}
