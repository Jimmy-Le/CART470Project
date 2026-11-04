
import bellUrl from '../../assets/Audio/Opening/BELL.mp3?url';
import windUrl from '../../assets/Audio/Opening/Wind.mp3?url';
import riverUrl from '../../assets/Audio/Opening/River.mp3?url';
import seagullUrl from '../../assets/Audio/Opening/Seagull.mp3?url';
import carUrl from '../../assets/Audio/Opening/CarPassing.mp3?url';

const AUDIO_URLS = {
    'BELL.mp3': bellUrl,
    'Wind.mp3': windUrl,
    'River.mp3': riverUrl,
    'Seagull.mp3': seagullUrl,
    'CarPassing.mp3': carUrl
};

// Each pre-balanced file plays at unity gain; envelopes only soften entrances/exits.
export function createIntroAudio(config) {
    let context;
    let generation = 0;
    let phase = 'idle';
    let cueTimer;
    let disposed = false;
    const buffers = new Map();
    const voices = new Set();

    function load(name) {
        if (!buffers.has(name)) {
            const url = AUDIO_URLS[config.files[name]];
            buffers.set(name, fetch(url).then((response) => {
                if (!response.ok) throw new Error('Audio unavailable');
                return response.arrayBuffer();
            }).then((data) => context.decodeAudioData(data)));
        }
        return buffers.get(name);
    }

    function fadeOut(voice, milliseconds) {
        const now = context.currentTime;
        const seconds = milliseconds / 1000;
        voice.gain.gain.cancelAndHoldAtTime(now);
        voice.gain.gain.linearRampToValueAtTime(0, now + seconds);
        voice.source.stop(now + seconds);
    }

    function stop(milliseconds = 0) {
        generation += 1;
        phase = 'idle';
        for (const voice of voices) fadeOut(voice, milliseconds);
        clearTimeout(cueTimer);
    }

    async function play(name, fadeInMs = 0, durationMs = null, fadeOutMs = 0) {
        const run = generation;
        const cuePhase = phase;

        try {
            const buffer = await load(name);

            if (
                disposed ||
                run !== generation ||
                (cuePhase !== phase && name !== 'wind') ||
                context.state !== 'running'
            ) return;

            const source = context.createBufferSource();
            const gain = context.createGain();

            const isWind = name === 'wind';
            const volume = Math.max(0, {
                wind: config.windVolume ?? 1,
                river: config.riverVolume ?? 1
            }[name] ?? 1);

            source.buffer = buffer;
            source.loop = isWind;

            source.connect(gain).connect(context.destination);

            const voice = { source, gain, name };
            voices.add(voice);

            source.onended = () => {
                voices.delete(voice);
                source.disconnect();
                gain.disconnect();
            };

            const now = context.currentTime;
            const entrance = fadeInMs / 1000;

            gain.gain.setValueAtTime(
                entrance > 0 ? 0 : volume,
                now
            );

            if (entrance > 0) {
                gain.gain.linearRampToValueAtTime(
                    volume,
                    now + entrance
                );
            }

            source.start(now);

            // Wind continues until the introduction ends.
            if (!isWind) {
                const seconds = Math.min(
                    buffer.duration,
                    durationMs === null
                        ? buffer.duration
                        : durationMs / 1000
                );

                const exit = Math.min(
                    fadeOutMs / 1000,
                    seconds / 2
                );

                if (exit > 0) {
                    gain.gain.setValueAtTime(
                        volume,
                        now + Math.max(entrance, seconds - exit)
                    );

                    gain.gain.linearRampToValueAtTime(
                        0,
                        now + seconds
                    );
                }

                source.stop(now + seconds);
            }
        } catch {
            // Audio is optional.
        }
    }

    return {
        begin() {
            if (disposed) return;
            stop();
            try {
                context ??= new AudioContext();
                // Called synchronously from the visitor's activation to unlock browser audio.
                const resumed = context.resume();
                const run = generation;
                phase = 'start';
                for (const name of Object.keys(config.files)) load(name).catch(() => { });
                resumed.then(() => {
                    if (run === generation && !disposed) play('bell');
                }).catch(() => { });
            } catch { /* Audio support is optional. */ }
        },
        zoom() {
            if (!context || disposed) return;
            phase = 'zoom';
            play('wind', config.windFadeInMs);
        },

        network() {
            if (!context || disposed) return;

            phase = 'network';

            // River begins with the connection animation.
            // It continues until finish() is called.
            play('river', config.riverFadeInMs);
        },


        seagull() {
            if (!context || disposed || phase !== 'network') return;

            const now = context.currentTime;
            const targetVolume = Math.max(0, config.riverDuckVolume ?? 0.12);
            const fadeSeconds = Math.max(0, config.riverDuckFadeMs ?? 700) / 1000;

            // Lower River volume and keep it lowered.
            for (const voice of voices) {
                if (voice.name !== 'river') continue;

                const gain = voice.gain.gain;

                gain.cancelAndHoldAtTime(now);
                gain.linearRampToValueAtTime(
                    targetVolume,
                    now + fadeSeconds
                );
            }

            play('seagull');
        },



        car() {
            if (!context || disposed || phase !== 'network') return;

            const run = generation;

            clearTimeout(cueTimer);

            cueTimer = setTimeout(() => {
                cueTimer = undefined;

                if (
                    disposed ||
                    run !== generation ||
                    phase !== 'network'
                ) return;

                play('car');
            }, config.carDelayMs ?? 0);
        },


        finish(quick = false) { stop(quick ? config.skipFadeOutMs : config.finalFadeOutMs); },
        dispose() {
            disposed = true;
            stop();
            context?.close().catch(() => { });
        }
    };
}
