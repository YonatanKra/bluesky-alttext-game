import { AltTextBot, BotPosts } from '../agent/find-altless-posts';
import { AltTextMeter } from './alt-text-meter/alt-text-meter';
import template from './app.template.html?raw';
import '@vonage/vivid/button';
import '@vonage/vivid/progress';
import '@vonage/vivid/text-field';

function defineElements() {
    customElements.define('alt-text-meter', AltTextMeter);
}

defineElements();

export class App extends HTMLElement {
    #bot: AltTextBot;

    get #startButton() {
        return this.shadowRoot?.querySelector('#start-button');
    }

    get #handle() {
        return (this.shadowRoot?.querySelector('[name="handle"]') as HTMLInputElement).value;
    }

    get #altTextMeter() {
        return this.shadowRoot?.querySelector('alt-text-meter');
    }

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = template;
        this.#bot = new AltTextBot();
        this.#startButton?.addEventListener('click', this.#start);
    }

    #start = async () => {
        if (!this.#handle) {
            return;
        }
        this.#altTextMeter.nTotal = 0;
        this.#altTextMeter.nAltLess = 0;
        this.#bot.run(this.#handle, this.#onStreamUpdate)
    }

    #onStreamUpdate = (result: BotPosts) => {
        this.#altTextMeter.nTotal += result.results.length;
        this.#altTextMeter.nAltLess += result.results.filter(result => result.imagesWithoutAlt.length).length;
    }
}