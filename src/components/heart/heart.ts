import heart from './heart.svg?raw';

function fillHeart(svg: SVGAElement, color: string, percentage: number) {
    // Validate percentage input (should be between 0 and 100)
    if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
    }

    // Calculate the fill height based on the SVG height and percentage
    const svgHeight = svg.getBBox().height;
    const fillHeight = (percentage < 30 ? 4 : percentage < 65 ? 2 : 0) + ((svgHeight / 100) * percentage);

    // Select the path element representing the heart shape
    const path = svg.querySelector('path') as SVGPathElement;

    // Create a new rect element to represent the fill area
    const fillRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    fillRect.setAttribute('x', '0');
    fillRect.setAttribute('y', `${svgHeight - fillHeight}`);
    fillRect.setAttribute('width', '100%');
    fillRect.setAttribute('height', `${fillHeight}`);
    fillRect.setAttribute('fill', color);

    // Create a mask to apply the fill inside the heart shape
    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute('id', 'heart-mask');

    const maskPath = path.cloneNode() as SVGPathElement;
    maskPath.setAttribute('fill', 'white');

    const g = svg.querySelector('g') as SVGGElement;
    g.innerHTML = '';

    mask.appendChild(maskPath);
    g.appendChild(mask);


    // Apply the mask to the fill rect
    fillRect.setAttribute('mask', 'url(#heart-mask)');

    // Ensure the original path remains in its original color
    g.appendChild(path);

    g.append(fillRect);
}

export class Heart extends HTMLElement {
    #color = 'red';
    #percentage = 0;

    get #heartElement() {
        return this.shadowRoot?.querySelector('svg') as unknown as SVGAElement;
    }

    #updateHeartColor = () => {
        fillHeart(this.#heartElement, this.#color, this.#percentage);
    }

    static get observedAttributes() {
        return ['color', 'percentage'];
    }

    attributeChangedCallback(attributeName, _, newValue) {
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
            ${heart}
        `;
    }

    connectedCallback() {
        fillHeart(this.#heartElement, this.#color, this.#percentage);
    }
}

customElements.define('love-meter', Heart);