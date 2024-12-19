import { type Progress } from '@vonage/vivid/progress';
import template from './alt-text-meter.template.html?raw';
import '../heart/heart';
import { type Heart } from '../heart/heart';

function numberToHexColor(value) {
    const toHex = (c) => {
        const hex = c.toString(16).padStart(2, '0');
        return hex;
    };

    value = Math.max(0, Math.min(100, value));

    const red = Math.round(255 * (value / 100));
    const green = Math.round(255 * (1 - value / 100));

    return `#${toHex(red)}${toHex(green)}00`;
}

export class AltTextMeter extends HTMLElement {

    static get observedAttributes() {
        return ['n-total', 'n-alt-less'];
    }

    attributeChangedCallback(attributeName, _, newValue) {
        if (attributeName === 'n-total') {
            this.#nTotal = Number(newValue);
        }

        if (attributeName === 'n-alt-less') {
            this.#nAltLess = Number(newValue);
        }

        this.#progressBarUpdate();
    }

    #nAltLess = 0;
    get nAltLess() {
        return this.#nAltLess;
    }
    set nAltLess(value: number) {
        this.#nAltLess = value;
        this.setAttribute('n-alt-less', value.toString());
        
    }

    #nTotal = 0;
    set nTotal(value: number) {
        this.#nTotal = value;
        this.setAttribute('n-total', value.toString());
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

    get #heartElement() {
        return this.querySelector('#heart') as Heart;
    }
    
    #updateProgressColor() {
        const color = numberToHexColor(this.#progressBar.value);
        this.#progressBar.style
            .setProperty('--vvd-color-canvas-text', color);
        this.#heartElement.color = color;
    }

    #updateProgressText() {
        this.#progressText.textContent = !this.#nTotal ? '' :
            `${this.#progressBar.value.toFixed(2)}% of your posts with media have Alt Text`;
    }

    #progressBarUpdate = () => {
        this.#progressBar.value = !this.nTotal ? 0 :
            100 * (this.nTotal - this.nAltLess) / this.nTotal;
        this.#heartElement.percentage = this.#progressBar.value;
        this.#updateProgressColor();
        this.#updateProgressText();
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = template;
        this.#progressBarUpdate();
    }
}