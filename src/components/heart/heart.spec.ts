import { describe, it, expect, beforeEach } from 'vitest';
import './heart.ts'
import { type Heart } from './heart';

const COMPONENT_NAME = 'love-meter';

describe('Heart Component', () => {
    let heartElement: Heart;

    beforeEach(() => {
        heartElement = document.createElement(COMPONENT_NAME) as Heart;
        document.body.appendChild(heartElement);
    });

    afterEach(() => {
        heartElement.remove();
    });

    describe('color', () => {
        it('should initialize with default color', () => {
            expect(heartElement.color).toBe('red');
        });

        it('should reflect color attribute', () => {
            heartElement.setAttribute('color', 'blue');
            expect(heartElement.color).toBe('blue');
        });

        it('should reflect the color property', async () => {
            heartElement.color = 'blue';
            expect(heartElement.getAttribute('color')).toBe('blue');
        });

        it('should set the color inside the SVG', async () => {
            heartElement.setAttribute('color', 'blue');
            const svg = getSvg();
            const stopElement = svg.querySelector('stop');
            expect(stopElement?.getAttribute('stop-color')).toBe('blue');
        });
    });

    const getSvg = () => heartElement.shadowRoot?.querySelector('svg') as unknown as SVGAElement;

    describe('percentage', () => {
        it('should initialize with default percentage', () => {
            expect(heartElement.percentage).toBe(0);
        });

        it('should reflect percentage attribute', () => {
            heartElement.setAttribute('percentage', '50');
            expect(heartElement.percentage).toBe(50);
        });

        it('should reflect the percentage property', async () => {
            heartElement.percentage = 50;
            expect(heartElement.getAttribute('percentage')).toBe('50');
        });

        it('should update animation when percentage is set', () => {
            const svg = getSvg();
            const animate1 = svg.querySelector('#animate1') as SVGAnimateElement;
            const animate2 = svg.querySelector('#animate2') as SVGAnimateElement;

            heartElement.setAttribute('percentage', '50');

            const startFrom = animate1.getAttribute('from');
            const startTo = animate1.getAttribute('to');
            const startFrom2 = animate2.getAttribute('from');
            const startTo2 = animate2.getAttribute('to');

            expect(startFrom).toBe('0');
            expect(startTo).toBe('0.5');
            expect(startFrom2).toBe('0');
            expect(startTo2).toBe('0.5');
        });

        it('should update the animation from the current percentage to the new percentage', () => {
            const svg = getSvg();
            const animate1 = svg.querySelector('#animate1') as SVGAnimateElement;
            const animate2 = svg.querySelector('#animate2') as SVGAnimateElement;

            heartElement.setAttribute('percentage', '50');
            heartElement.setAttribute('percentage', '75');

            const secondFrom = animate1.getAttribute('from');
            const secondTo = animate1.getAttribute('to');
            const secondFrom2 = animate2.getAttribute('from');
            const secondTo2 = animate2.getAttribute('to');
            
            expect(secondFrom).toBe('0.5');
            expect(secondTo).toBe('0.75');
            expect(secondFrom2).toBe('0.5');
            expect(secondTo2).toBe('0.75');
        });

        it('should throw an error for invalid percentage', () => {
            expect(() => heartElement.attributeChangedCallback('percentage', '0', '150')).toThrow('Percentage must be between 0 and 100');    
        });
    });

    describe('size', () => {
        it('should init as 24', async () => {
            expect(heartElement.size).toBe(24);
        });

        it('should reflect size attribute', () => {
            heartElement.setAttribute('size', '50');
            expect(heartElement.size).toBe(50);
        });

        it('should reflect the size property', async () => {
            heartElement.size = 50;
            expect(heartElement.getAttribute('size')).toBe('50');
        });

        it('should set the size of the SVG', async () => {
            heartElement.setAttribute('size', '50');
            const svg = getSvg();
            expect(svg.getAttribute('height')).toBe('50');
            expect(svg.getAttribute('width')).toBe('50');
        });

        it('should set the size of the SVG when property is set', async () => {
            heartElement.size = 50;
            const svg = getSvg();
            expect(svg.getAttribute('height')).toBe('50');
            expect(svg.getAttribute('width')).toBe('50');
        });

        it('should revert to latest value if invalid number', async () => {
            heartElement.size = 50;
            heartElement.setAttribute('size', 'abc');
            const svg = getSvg();
            expect(svg.getAttribute('height')).toBe('50');
            expect(svg.getAttribute('width')).toBe('50');
        });

        it('should revert to latest value when changed to invalid value from property', async () => {
            heartElement.size = 50;
            (heartElement.size as any) = 'abc';
            const svg = getSvg();
            heartElement.size = 50;
        });
    });
});