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
            const fillRect = svg.querySelector('rect');
            expect(fillRect?.getAttribute('fill')).toBe('blue');
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

        it('should fill the heart with perncetage of height plus 2 when between 30 and 65', () => {
            const svg = getSvg();
            heartElement.setAttribute('percentage', '50');
            
            const fillRect = svg.querySelector('rect');
            expect(fillRect?.getAttribute('height')).toBe('52');
        });

        it('should fill the heart with perncetage of height plus 4 when below 30', () => {
            const svg = getSvg();
            heartElement.setAttribute('percentage', '25');
            
            const fillRect = svg.querySelector('rect');
            expect(fillRect?.getAttribute('height')).toBe('29');
        });

        it('should fill the heart with perncetage of height when 65 and above', () => {
            const svg = getSvg();
            heartElement.setAttribute('percentage', '70');
            
            const fillRect = svg.querySelector('rect');
            expect(fillRect?.getAttribute('height')).toBe('70');
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