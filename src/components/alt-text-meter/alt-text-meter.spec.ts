import { type Progress } from '@vonage/vivid/progress';
import { AltTextMeter } from './alt-text-meter';

const ELEMENT_NAME = 'alt-text-meter';

describe('AltTextMeter', () => {
    let component: AltTextMeter;

    beforeAll(() => {
        customElements.define(ELEMENT_NAME, AltTextMeter);
    });

    beforeEach(async () => {
        component = document.createElement(ELEMENT_NAME) as AltTextMeter;
        document.body.appendChild(component);
    });

    afterEach(async () => {
        component.remove();
    });

    it('should be defined', async () => {
        expect(customElements.get(ELEMENT_NAME)).toBe(AltTextMeter);
    });

    describe('nTotal', () => {
        it('should init to zero', async () => {
            expect(component.nTotal).toBe(0);
        });

        it('should reflect nTotal property to attribute', async () => {
            component.nTotal = 5;
            expect(component.getAttribute('n-total')).toBe('5');
        });

        it('should reflect nTotal attribute to property', async () => {
            component.setAttribute('n-total', '5');
            expect(component.nTotal).toBe(5);
        });
    });

    describe('nAltLess', () => {
        it('should init to zero', async () => {
            expect(component.nTotal).toBe(0);
        });

        it('should reflect nAltLess property to attribute', async () => {
            component.nAltLess = 5;
            expect(component.getAttribute('n-alt-less')).toBe('5');
        });

        it('should reflect nAltLess attribute to property', async () => {
            component.setAttribute('n-alt-less', '5');
            expect(component.nAltLess).toBe(5);
        });

        it('should update the progress bar when nAltLess changes', async () => {
            const progressBar = component.querySelector('#progress') as Progress;
            component.nTotal = 100;
            component.setAttribute('n-alt-less', '50');
            expect(progressBar.value).toBe(50);
        });
    });

    it('should set progress bar value to zero if nTotal is zero', async () => {
        const progressBar = component.querySelector('#progress');
        component.nTotal = 0;
        expect(progressBar.value).toBe(0);
    });

    it('should set the value of vwc-progress according to nTotal and nAltLess', async () => {
        const progressBar = component.querySelector('#progress');
        component.nTotal = 50;
        expect(progressBar.value).toBe(100);
        component.nAltLess = 25;
        expect(progressBar.value).toBe(50);
        component.nAltLess = 10;
        expect(progressBar.value).toBe(80);
        component.nAltLess = 40;
        expect(progressBar.value).toBe(20);
    });

    it('should set --vvd-color-canvas-text according to value range', async () => {
        function getCssVariableValue(element) {
            const computedStyles = getComputedStyle(element);
            return computedStyles.getPropertyValue('--vvd-color-canvas-text').trim();
        }

        const progressBar = component.querySelector('#progress') as Progress;
        component.nTotal = 100;

        component.nAltLess = 90;
        const colorWith10 = getCssVariableValue(progressBar);
        component.nAltLess = 24;
        const colorWith76 = getCssVariableValue(progressBar);
        component.nAltLess = 45;
        const colorWith55 = getCssVariableValue(progressBar);
        component.nAltLess = 70;
        const colorWith30 = getCssVariableValue(progressBar);
        component.nAltLess = 0;
        const colorWith100 = getCssVariableValue(progressBar);

        expect(colorWith10).toBe('#1ae600');
        expect(colorWith76).toBe('#c23d00');
        expect(colorWith55).toBe('#8c7300');
        expect(colorWith30).toBe('#4db300');
        expect(colorWith100).toBe('#ff0000');
    });

    it('should set the meter text', async () => {
        const textElement = component.querySelector('#progress-text');
        component.nTotal = 100;
        component.nAltLess = 90;
        expect(textElement?.textContent).toBe("10.00% of your posts with media have Alt Text")
    });

    it('should set the heart color according to the meter color', async () => {
        const heart = component.querySelector('#heart') as SVGAElement;
        component.nTotal = 100;
        component.nAltLess = 90;
        expect(heart.getAttribute('color')).toBe('#1ae600');
    });

    it('should match the heart percentage according meter percentage', async () => {
        const heart = component.querySelector('#heart') as SVGAElement;
        component.nTotal = 100;
        component.nAltLess = 90;
        expect(heart.getAttribute('percentage')).toBe('10');
    });
});