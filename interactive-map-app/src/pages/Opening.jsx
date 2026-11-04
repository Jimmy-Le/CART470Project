import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { createOpeningMap } from '../components/opening/createIntroMap.js';
import { startIntro } from '../components/opening/introController.js';
import { introConfig } from '../components/opening/introConfig.js';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../components/opening/Opening.css';

function Opening() {
    const mapContainer = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!mapContainer.current) return;

        // Step 1: Create the MapLibre map
        const map = createOpeningMap(mapContainer.current);

        // Step 2: Start the opening controller
        startIntro(
            map,
            document.querySelector('#skip-intro'),
            introConfig,
            () => navigate('/')
        );

        // Step 3: Clean up when React unmounts Opening
        return () => {
            map.remove();
        };
    }, [navigate]);


    return (
        < main className="opening-page prototype-main">
            <div className="intro-map-stage">

                {/* Map container */}
                <section
                    ref={mapContainer}
                    className="prototype-map"
                    id="map"
                    aria-label="Interactive map of Montreal"
                />

                {/*Attract screen */}
                <section
                    className="intro-overlay intro-attract"
                    id="intro-attract"
                    aria-label="Begin the introduction"
                    hidden
                >
                    <div className="intro-overlay__card">
                        <button
                            className="prototype-button intro-overlay__explore"
                            type="button"
                        >
                            Touch to Begin
                        </button>
                    </div>
                </section>

                {/* Skip Intro button */}
                <button
                    className="prototype-button intro-skip"
                    id="skip-intro"
                    type="button"
                    aria-controls="map"
                    hidden
                >
                    Skip Intro
                </button>

                {/* Map error message */}
                <p
                    className="prototype-map-error"
                    id="map-error"
                    role="alert"
                    hidden
                />

                {/* Introduction overlay */}
                <section
                    className="intro-overlay"
                    id="intro-overlay"
                    aria-labelledby="intro-title"
                    aria-describedby="intro-copy"
                    hidden
                >
                    <div className="intro-overlay__card">
                        <h2 id="intro-title" tabIndex={-1}>
                            The Hochelaga Archipelago
                        </h2>

                        <div id="intro-copy">
                            <p>
                                Where the St. Lawrence and Ottawa rivers
                                meet, hundreds of islands and islets form
                                the Hochelaga Archipelago.
                            </p>

                            <p>
                                Together, they create a landscape of
                                waterways, places, and stories waiting
                                to be explored.
                            </p>
                        </div>

                        <button
                            className="prototype-button intro-overlay__explore"
                            type="button"
                        >
                            Explore the Archipelago

                        </button>

                        <button
                            className="intro-overlay__replay"
                            type="button"
                        >
                            <span aria-hidden="true">↻</span> Watch Again
                        </button>

                        <p
                            className="intro-overlay__message"
                            role="status"
                        />
                    </div>
                </section>

            </div>
        </main>
    );
}

export default Opening;
