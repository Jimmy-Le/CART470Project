
const overlays = new WeakMap();

export function createIntroOverlay(
    element,
    config,
    onReplay = () => { },
    onExplore = () => { }
) {

    const exploreButton = element.querySelector(
        '.intro-overlay__explore'
    );
    const replayButton = element.querySelector(
        '.intro-overlay__replay'
    );
    const message = element.querySelector(
        '.intro-overlay__message'
    );

    let shown = false;

    const handleReplay = () => onReplay();

    const handleExplore = () => {
        onExplore();
    };

    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    replayButton.addEventListener('click', handleReplay);
    exploreButton.addEventListener('click', handleExplore);
    element.addEventListener('click', stopPropagation);

    const controller = {
        show() {
            if (shown) return;

            shown = true;
            element.hidden = false;

            element.querySelector('h2')?.focus({
                preventScroll: true
            });
        },

        hide() {
            shown = false;
            element.hidden = true;
            message.textContent = '';
        },

        dispose() {
            replayButton.removeEventListener(
                'click',
                handleReplay
            );

            exploreButton.removeEventListener(
                'click',
                handleExplore
            );

            element.removeEventListener(
                'click',
                stopPropagation
            );

            overlays.delete(element);
        }
    };

    overlays.set(element, controller);

    return controller;
}
