
import { useEffect, useRef } from 'react';

export default function ExperimentIsland({
    island,
    onSelect,
    //add extra export variables 
    isFocused = false,
    isDimmed = false
}) {
    const audio = useRef(null);

    useEffect(() => {
        if (!island.audio) return;

        const sound = new Audio(island.audio);
        sound.loop = true;
        audio.current = sound;

        return () => {
            sound.pause();
            sound.removeAttribute('src');
            sound.load();
            audio.current = null;
        };
    }, [island.audio]);

    const play = () => {
        audio.current?.play().catch(() => { });
    };

    const stop = () => {
        if (audio.current) {
            audio.current.pause();
            audio.current.currentTime = 0;
        }
    };

    return (
        <button
            type="button"

            //new class name 
            className={`island ${isFocused ? 'focused' : ''} ${isDimmed ? 'dimmed' : ''}`}


            data-island={island.id}
            style={{
                left: island.x,
                top: island.y,
                width: island.width,
                height: island.height,

                // New: control opacity directly with React
                opacity: isDimmed ? 0.15 : 1,
                transition: 'opacity 0.6s ease',
            }}
            aria-label={`${island.name} — show island information`}
            onMouseEnter={play}
            onMouseLeave={stop}
            onFocus={play}
            onBlur={stop}
            onClick={event => {
                event.stopPropagation();
                onSelect?.(island.id);
            }}
        >
            <svg
                viewBox={island.viewBox}
                aria-hidden="true"
            >
                <path
                    className="land"
                    d={island.coast}
                />
            </svg>

            <img
                className="team-island-image"
                src={island.image}
                alt=""
                draggable="false"
            />

            {/* Detailed island illustration. Only rendered when detailImage is available. */}
            {island.detailImage && (
                <img
                    className="experiment-detail-image"
                    src={island.detailImage}
                    alt=""
                    draggable="false"
                />
            )}
        </button>
    );
}
