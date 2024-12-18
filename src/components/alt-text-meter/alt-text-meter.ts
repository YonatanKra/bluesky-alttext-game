import { type Progress } from '@vonage/vivid/progress';

function numberToHexColor(value) {
    // Clamp the value between 0 and 100
    value = Math.max(0, Math.min(100, value));

    // Calculate red and green components
    const red = Math.round(255 * (1 - value / 100));
    const green = Math.round(255 * (value / 100));

    // Convert to hex format
    const toHex = (c) => {
        const hex = c.toString(16).padStart(2, '0');
        return hex;
    };

    return `#${toHex(red)}${toHex(green)}00`; // Red and Green, Blue is always 0
}

export class AltTextMeter extends HTMLElement {

    static get observedAttributes() {
        return ['n-total', 'n-alt-less'];
    }

    attributeChangedCallback(attributeName, _, newValue) {
        if (attributeName === 'n-total') {
            this.#nTotal = Number(newValue);
            return;
        }

        if (attributeName === 'n-alt-less') {
            this.#nAltLess = Number(newValue);
            return;
        }
    }

    #nAltLess = 0;
    get nAltLess() {
        return this.#nAltLess;
    }
    set nAltLess(value: number) {
        this.#nAltLess = value;
        this.setAttribute('n-alt-less', value.toString());
        this.#progressBarUpdate();
    }

    #nTotal = 0;
    set nTotal(value: number) {
        this.#nTotal = value;
        this.setAttribute('n-total', value.toString());
        this.#progressBarUpdate();
    }

    get nTotal() {
        return this.#nTotal;
    }

    get #progressBar() {
        return this.querySelector('#progress') as Progress;
    }

    get #progressText() {
        return this.querySelector('#progress-text') as Slider;
    }

    #updateProgressColor() {
        this.#progressBar.style
            .setProperty('--vvd-color-canvas-text', numberToHexColor(this.#progressBar.value))
    }

    #updateProgressText() {
        this.#progressText.textContent = !this.#nTotal ? '' :
            `${this.#progressBar.value.toFixed(2)}% of your posts with media have Alt Text`;
    }
    #progressBarUpdate = () => {
        this.#progressBar.value = !this.nTotal ? 0 :
            100 * (this.nTotal - this.nAltLess) / this.nTotal;
        this.#updateProgressColor();
        this.#updateProgressText();
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<div style="height: 1em; margin: 1em;" id="progress-text"></div><vwc-progress min="0" max="100" id="progress"></vwc-progress>`;
        this.#progressBarUpdate();
    }
}