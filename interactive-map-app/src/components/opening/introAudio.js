
import bellUrl from '../../assets/audio/Opening/BELL.mp3?url';
import windUrl from '../../assets/audio/Opening/Wind.mp3?url';
import riverUrl from '../../assets/audio/Opening/River.mp3?url';
import seagullUrl from '../../assets/audio/Opening/Seagull.mp3?url';
import carUrl from '../../assets/audio/Opening/CarPassing.mp3?url';

const AUDIO_URLS = {
    'BELL.mp3': bellUrl,
    'Wind.mp3': windUrl,
    'River.mp3': riverUrl,
    'Seagull.mp3': seagullUrl,
    'CarPassing.mp3': carUrl
};

// Wind and River overlap consecutive AudioBufferSources. Unlike source.loop,
// the end of each recording fades out while the next copy fades in.
export function createIntroAudio(config) {
    let context;
    let generation = 0;
    let phase = 'idle';
    let disposed = false;
    let cueTimer;
    let schedulerTimer;
    let riverDucked = false;

    const ambient = config.ambient ?? {};
    const buffers = new Map();
    const tracks = new Map();
    const pendingTracks = new Set();
    const voices = new Set();

    const number = (value, fallback) => Number.isFinite(value) ? value : fallback;
    const milliseconds = (value, fallback = 0) => Math.max(0, number(value, fallback));
    const volume = (value, fallback = 1) => Math.max(0, number(value, fallback));

    function load(name) {
        if (!buffers.has(name)) {
            const url = AUDIO_URLS[config.files[name]];
            if (!url) return Promise.reject(new Error(`Unknown audio file: ${name}`));
            buffers.set(name, fetch(url).then((response) => {
                if (!response.ok) throw new Error(`Audio unavailable: ${name}`);
                return response.arrayBuffer();
            }).then((data) => context.decodeAudioData(data)).catch((error) => {
                buffers.delete(name); // Allow a later retry if loading fails.
                throw error;
            }));
        }
        return buffers.get(name);
    }

    function ramp(param, target, durationMs) {
        if (!context) return;
        const now = context.currentTime;
        const duration = milliseconds(durationMs) / 1000;
        // cancelAndHoldAtTime preserves the current level while cancelling a
        // previous ramp (important when Seagull ducks River mid-fade).
        if (typeof param.cancelAndHoldAtTime === 'function') {
            param.cancelAndHoldAtTime(now);
        } else {
            const current = param.value;
            param.cancelScheduledValues(now);
            param.setValueAtTime(current, now);
        }
        if (duration === 0) param.setValueAtTime(target, now);
        else param.linearRampToValueAtTime(target, now + duration);
    }

    function rememberVoice(source, gain, name, startTime, endTime, track = null) {
        const voice = { source, gain, name, startTime, endTime, track };
        voices.add(voice);
        source.onended = () => {
            voices.delete(voice);
            try { source.disconnect(); gain.disconnect(); } catch { /* Already detached. */ }
        };
        return voice;
    }

    function desiredVolume(name) {
        if (phase === 'ambience') {
            return volume(ambient[`${name}Volume`], name === 'wind' ? 0.15 : 0.25);
        }
        if (name === 'wind') return volume(config.windVolume, 1);
        return riverDucked
            ? volume(config.riverDuckVolume, 0.5)
            : volume(config.riverVolume, 1);
    }

    function crossfadeSeconds(name, duration) {
        const setting = name === 'wind' ? ambient.windCrossfadeMs : ambient.riverCrossfadeMs;
        // Prevent an excessively long overlap if a short recording is used.
        return Math.min(milliseconds(setting, 1500) / 1000, duration * 0.25);
    }

    function scheduleTrack(track, lookaheadSeconds) {
        if (!context || disposed || tracks.get(track.name) !== track) return;
        const now = context.currentTime;
        const endOfWindow = now + lookaheadSeconds;
        // If a background tab throttled the scheduler for a long time,
        // restart instead of layering many already-expired copies at once.
        if (track.nextTime + track.buffer.duration < now) {
            track.nextTime = now + 0.025;
            track.first = true;
        }
        let safety = 0;

        while (track.nextTime < endOfWindow && safety++ < 60) {
            const start = track.nextTime;
            const duration = track.buffer.duration;
            const overlap = track.overlap;
            const end = start + duration;
            const source = context.createBufferSource();
            const gain = context.createGain();
            source.buffer = track.buffer;
            source.loop = false;
            source.connect(gain).connect(track.master);

            // The first copy starts normally. Later copies fade in over the
            // tail of the previous copy, which simultaneously fades out.
            gain.gain.setValueAtTime(track.first ? 1 : 0, start);
            if (!track.first && overlap > 0) {
                gain.gain.linearRampToValueAtTime(1, start + overlap);
            }
            if (overlap > 0) {
                gain.gain.setValueAtTime(1, end - overlap);
                gain.gain.linearRampToValueAtTime(0, end);
            }

            rememberVoice(source, gain, track.name, start, end, track);
            source.start(start);
            source.stop(end);

            track.first = false;
            track.nextTime += track.period;
        }
    }

    function scheduleAllTracks() {
        if (!context || context.state !== 'running') return;
        for (const track of tracks.values()) {
            // Scheduling ahead on the audio clock reduces seams caused by
            // timer delays or React rendering pauses.
            const ahead = Math.max(3, Math.min(30, track.period * 2.5));
            scheduleTrack(track, ahead);
        }
    }

    function startScheduler() {
        if (schedulerTimer !== undefined) return;
        schedulerTimer = setInterval(scheduleAllTracks, 250);
    }

    async function ensureLoop(name, fadeInMs) {
        if (!context || disposed || tracks.has(name) || pendingTracks.has(name)) return;
        const run = generation;
        pendingTracks.add(name);
        try {
            const buffer = await load(name);
            if (disposed || run !== generation ||
                !['zoom', 'network', 'ambience'].includes(phase) ||
                context.state !== 'running' ||
                !Number.isFinite(buffer.duration) || buffer.duration <= 0) return;

            const overlap = crossfadeSeconds(name, buffer.duration);
            const master = context.createGain();
            master.connect(context.destination);
            const track = {
                name,
                buffer,
                master,
                overlap,
                period: buffer.duration - overlap,
                nextTime: context.currentTime + 0.025,
                first: true
            };
            tracks.set(name, track);
            master.gain.setValueAtTime(0, context.currentTime);
            ramp(master.gain, desiredVolume(name), fadeInMs);
            startScheduler();
            scheduleAllTracks();
        } catch {
            // Missing audio or unsupported decoding should not block Opening.
        } finally {
            pendingTracks.delete(name);
        }
    }

    async function playOneShot(name, fadeInMs = 0, durationMs = null, fadeOutMs = 0) {
        if (!context || disposed) return;
        const run = generation;
        const cuePhase = phase;
        try {
            const buffer = await load(name);
            if (disposed || run !== generation || cuePhase !== phase ||
                context.state !== 'running') return;

            const seconds = Math.min(buffer.duration,
                durationMs === null ? buffer.duration : milliseconds(durationMs) / 1000);
            if (seconds <= 0) return;

            const source = context.createBufferSource();
            const gain = context.createGain();
            source.buffer = buffer;
            source.loop = false;
            source.connect(gain).connect(context.destination);
            const now = context.currentTime;
            const entrance = Math.min(milliseconds(fadeInMs) / 1000, seconds / 2);
            const exit = Math.min(milliseconds(fadeOutMs) / 1000, seconds / 2);
            gain.gain.setValueAtTime(entrance ? 0 : 1, now);
            if (entrance) gain.gain.linearRampToValueAtTime(1, now + entrance);
            if (exit) {
                gain.gain.setValueAtTime(1, now + seconds - exit);
                gain.gain.linearRampToValueAtTime(0, now + seconds);
            }
            rememberVoice(source, gain, name, now, now + seconds);
            source.start(now);
            source.stop(now + seconds);
        } catch {
            // The visual experience remains usable without sound.
        }
    }

    function fadeOutOneShots(durationMs) {
        if (!context) return;
        const now = context.currentTime;
        const seconds = milliseconds(durationMs) / 1000;
        for (const voice of voices) {
            if (voice.track) continue;
            ramp(voice.gain.gain, 0, durationMs);
            try { voice.source.stop(Math.min(voice.endTime, now + seconds)); } catch { /* Ended. */ }
        }
    }

    function stopAll(fadeOutMs = 0) {
        generation += 1; // Invalidate asynchronous loads and one-shot cues.
        phase = 'idle';
        riverDucked = false;
        clearTimeout(cueTimer);
        cueTimer = undefined;
        clearInterval(schedulerTimer);
        schedulerTimer = undefined;
        const seconds = milliseconds(fadeOutMs) / 1000;
        const now = context?.currentTime ?? 0;

        for (const track of tracks.values()) {
            ramp(track.master.gain, 0, fadeOutMs);
            // Disconnect after fading. Every scheduled source expires on its own.
            setTimeout(() => {
                try { track.master.disconnect(); } catch { /* Context disposed. */ }
            }, milliseconds(fadeOutMs) + 50);
        }
        tracks.clear();
        pendingTracks.clear();
        for (const voice of voices) {
            if (voice.track) continue; // Its track's master is fading out.
            ramp(voice.gain.gain, 0, fadeOutMs);
            try { voice.source.stop(Math.min(voice.endTime, now + seconds)); } catch { /* Ended. */ }
        }
    }

    function enterAmbience(quick) {
        if (!context || disposed || phase === 'ambience') return;
        phase = 'ambience';
        clearTimeout(cueTimer);
        cueTimer = undefined;
        fadeOutOneShots(quick ? config.skipFadeOutMs : config.finalFadeOutMs);
        const transition = milliseconds(ambient.transitionMs, 1800);

        for (const name of ['wind', 'river']) {
            const track = tracks.get(name);
            if (track) ramp(track.master.gain, desiredVolume(name), transition);
            else ensureLoop(name, transition); // Covers Skip before either sound starts.
        }
    }

    return {
        begin() {
            if (disposed) return;
            stopAll(milliseconds(ambient.replayFadeOutMs, 450));
            try {
                context ??= new AudioContext();
                // The visitor's click unlocks browser audio playback.
                const resumed = context.resume();
                const run = generation;
                phase = 'start';
                for (const name of Object.keys(config.files)) load(name).catch(() => {});
                resumed.then(() => {
                    if (!disposed && run === generation && phase === 'start') playOneShot('bell');
                }).catch(() => {});
            } catch { /* Audio support is optional. */ }
        },
        zoom() {
            if (!context || disposed) return;
            phase = 'zoom';
            ensureLoop('wind', config.windFadeInMs);
        },
        network() {
            if (!context || disposed) return;
            phase = 'network';
            ensureLoop('river', config.riverFadeInMs);
        },
        seagull() {
            if (!context || disposed || phase !== 'network') return;
            riverDucked = true;
            const track = tracks.get('river');
            if (track) ramp(track.master.gain,
                desiredVolume('river'), config.riverDuckFadeMs);
            playOneShot('seagull');
        },
        car() {
            if (!context || disposed || phase !== 'network') return;
            const run = generation;
            clearTimeout(cueTimer);
            cueTimer = setTimeout(() => {
                cueTimer = undefined;
                if (!disposed && run === generation && phase === 'network') {
                    playOneShot('car');
                }
            }, milliseconds(config.carDelayMs));
        },
        // The overlay is now an ambience phase, not an audio shutdown.
        finish(quick = false) { enterAmbience(quick); },
        // Called before leaving Opening; replay starts a new generation.
        stop(fadeOutMs = ambient.stopFadeMs ?? 650) { stopAll(fadeOutMs); },
        dispose() {
            if (disposed) return;
            disposed = true;
            stopAll(0);
            if (context) context.close().catch(() => {});
        }
    };
}
