import heart from './heart.svg?raw';

function fillHeart(svg: SVGElement, color: string, percentage: number) {
    // Validate percentage input (should be between 0 and 100)
    if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
    }

    // Calculate the fill height based on the SVG height and percentage
    restartAnimation(svg, color, percentage / 100);
}

function restartAnimation(svg: SVGElement, color: string, ratio: number) {
    const animate1 = svg.querySelector('#animate1') as SVGAnimateElement;
    const animate2 = svg.querySelector('#animate2') as SVGAnimateElement;
    const from = animate1.getAttribute('to');

    // Update the 'to' attribute and color
    animate1.setAttribute('to', `${ratio}`);
    animate1.setAttribute('from', `${from}`);
    animate1.parentElement?.setAttribute('stop-color', color);
    animate2.setAttribute('to', `${ratio}`);
    animate2.setAttribute('from', `${from}`);

    // Restart the animation by setting the 'begin' attribute to 'indefinite' and then triggering it
    animate1.setAttribute('begin', '0s');
    animate2.setAttribute('begin', '0s');
    animate1.beginElement();
    animate2.beginElement();
}

const DEFAULT_SIZE = 24;

export class Heart extends HTMLElement {
    #color = 'red';
    #percentage = 0;
    #size;

    get #heartElement() {
        return this.shadowRoot?.querySelector('svg') as unknown as SVGElement;
    }

    #updateHeartColor = () => {
        fillHeart(this.#heartElement, this.#color, this.#percentage);
    }

    static get observedAttributes() {
        return ['color', 'percentage', 'size'];
    }

    get size() {
        return this.#size;
    }

    set size(value: number) {
        this.setAttribute('size', value.toString());
    }

    #updateHeartSize = () => {
        this.#heartElement.setAttribute('width', this.#size.toString());
        this.#heartElement.setAttribute('height', this.#size.toString());
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        if (attributeName === 'color') {
            this.#color = newValue;
            this.#updateHeartColor();
            return;
        }

        if (attributeName === 'percentage') {
            this.#percentage = Number(newValue);
            this.#updateHeartColor();
            return;
        }

        if (attributeName === 'size') {
            this.#size = Number.isNaN(Number(newValue)) ? oldValue : Number(newValue);
            this.#updateHeartSize();
            return;
        }
    }

    get color() {
        return this.#color;
    }

    set color(value: string) {
        this.setAttribute('color', value);
    }

    get percentage() {
        return this.#percentage;
    }

    set percentage(value: number) {
        this.setAttribute('percentage', value.toString());
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                svg {
                    transition: width 0.3s, height 0.3s;
                }
            </style>
            ${heart}
        `;
    }

    connectedCallback() {
        if (!this.size) {
            this.size = DEFAULT_SIZE;
        }
        fillHeart(this.#heartElement, this.#color, this.#percentage);
    }
}

customElements.define('love-meter', Heart);