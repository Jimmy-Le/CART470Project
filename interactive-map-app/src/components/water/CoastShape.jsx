import { useId } from 'react';
import './CoastShape.css';

export default function CoastShape({ island }) {
  const filterId = useId();
  return <>
    <svg viewBox={island.viewBox} aria-hidden="true">
      {/* The water engine reads this path for current avoidance. */}
      <path className="land" d={island.coast} />
      <defs>
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="135%"
          colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
          <feComponentTransfer result="silhouette">
            <feFuncA type="linear" slope="16" intercept="-1.25" />
          </feComponentTransfer>
          <feMorphology in="silhouette" operator="dilate" radius="1.8" result="outline" />
          <feGaussianBlur in="outline" stdDeviation="2.5" />
          <feOffset dy="5" result="offset" />
          <feFlood floodColor="#41463c" floodOpacity=".52" />
          <feComposite in2="offset" operator="in" result="shadow" />
          <feFlood floodColor="#eee6d4" floodOpacity=".8" />
          <feComposite in2="outline" operator="in" result="rim" />
          <feMerge><feMergeNode in="shadow" /><feMergeNode in="rim" /></feMerge>
          <feComposite in2="silhouette" operator="out" result="outerEdge" />
          <feMerge><feMergeNode in="outerEdge" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
    <img className="team-island-image" src={island.image} alt="" draggable="false"
      style={{ '--watercolor-filter': `url("#${filterId}")` }} />
  </>;
}
