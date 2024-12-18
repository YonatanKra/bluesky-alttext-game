import { BotPosts } from '../agent/find-altless-posts';
import { AltTextMeter } from './alt-text-meter/alt-text-meter';
import { App } from './app';

let botMock;

const resetBotMock = () => {
    botMock = {
        run: vi.fn(),
        streamPosts: vi.fn()
    };
}

vi.mock('../agent/find-altless-posts.ts', () => ({
    AltTextBot: vi.fn(() => botMock),
}));

const ELEMENT_NAME = 'app-element';
describe('App', () => {
    let app: App;

    beforeAll(() => {
        customElements.define(ELEMENT_NAME, App);
    });

    beforeEach(async () => {
        resetBotMock();
        app = document.createElement(ELEMENT_NAME) as App;
        document.body.appendChild(app);
    });

    afterEach(() => {
        app.remove();
    });

    describe('init', () => {
        it('should define the element', async () => {
            expect(customElements.get(ELEMENT_NAME)).toBe(App);
        });

        it('should define child elements', async () => {
            expect(customElements.get('alt-text-meter')).toBe(AltTextMeter);
        });
    });

    it('should call bot run with handle from the text field when the start button is clicked', async () => {
        const handleField = startButtonClick(app, 'mockHandle');
        expect(botMock.run).toHaveBeenCalledWith(handleField.value, expect.any(Function));
    });

    it('should prevent call to run if handle is missing', async () => {
        startButtonClick(app);
        expect(botMock.run).toHaveBeenCalledTimes(0);
    });

    it('should set alt-text-meter with nAltless and nTotal values on every call to its callback', async () => {
        const altTextMeter = app.shadowRoot?.querySelector('alt-text-meter');
        startButtonClick(app, 'mockHandle');
        const streamCallback = botMock.run.mock.calls[0][1];

        const input1: BotPosts = {
            results: [
                {
                    imagesWithoutAlt: [],
                    text: '',
                    createdAt: ''
                },
                {
                    imagesWithoutAlt: ['image1'],
                    text: '',
                    createdAt: ''
                }],
            done: false
        };
        streamCallback(input1);

        const altTextMeterValuesAfterFirstStream = {
            nAltless: altTextMeter.nAltLess,
            nTotal: altTextMeter.nTotal
        };

        const input2: BotPosts = {
            results: [
                {
                    imagesWithoutAlt: [],
                    text: '',
                    createdAt: ''
                },
                {
                    imagesWithoutAlt: [],
                    text: '',
                    createdAt: ''
                },
                {
                    imagesWithoutAlt: ['altLess'],
                    text: '',
                    createdAt: ''
                }],
            done: true
        };

        streamCallback(input2);
        
        const altTextMeterValuesAfterSecondStream = {
            nAltless: altTextMeter.nAltLess,
            nTotal: altTextMeter.nTotal
        };

        expect(altTextMeterValuesAfterFirstStream).toEqual({
            nAltless: 1,
            nTotal: 2
        });

        expect(altTextMeterValuesAfterSecondStream).toEqual({
            nAltless: 2,
            nTotal: 5
        });
    });

    // TODO:: test a user-details, alt-text-meter and alt-text-history inputs
    // TODO:: create the components one by one
    it('should calculate the alt text score on every stram batch and set it in the progress', async () => {
        
    });
});

function startButtonClick(app: App, mockHandle?: string) {
    const handleField = app.shadowRoot?.querySelector('[name="handle"]') as HTMLInputElement;
    handleField.value = mockHandle;
    const loginButton = app.shadowRoot?.querySelector('#start-button') as HTMLButtonElement;
    loginButton.click();
    return handleField;
}
