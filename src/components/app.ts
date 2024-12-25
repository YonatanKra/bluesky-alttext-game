import { AltTextBot, BotPosts } from '../agent/find-altless-posts';
import { AltTextMeter } from './alt-text-meter/alt-text-meter';
import template from './app.template.html?raw';
import '@vonage/vivid/button';
import '@vonage/vivid/progress';
import '@vonage/vivid/text-field';
import '@vonage/vivid/card';
import '@vonage/vivid/header';
import '@vonage/vivid/menu';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

function defineElements() {
    customElements.define('alt-text-meter', AltTextMeter);
}

defineElements();

export class App extends HTMLElement {
    #bot: AltTextBot;
    get #handleMenuElement() {
        return this.shadowRoot?.querySelector('#handle-menu') as HTMLMenuElement;
    }

    get #startButton() {
        return this.shadowRoot?.querySelector('#start-button');
    }

    get #handle() {
        return this.#handleElement.value;
    }

    get #handleElement() {
        return this.shadowRoot?.querySelector('[name="handle"]') as HTMLInputElement;
    }

    get #altTextMeter() {
        return this.shadowRoot?.querySelector('alt-text-meter') as AltTextMeter;
    }

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = template;
        this.#bot = new AltTextBot();
        this.#startButton?.addEventListener('click', this.#start);
        this.#handleElement?.addEventListener('input', this.#onInput);
        this.#handleElement?.addEventListener('keydown', this.#onKeyDown);
        this.#handleElement?.addEventListener('focus', this.#onInput);
        this.#handleMenuElement?.addEventListener('click', this.#onHandleSelected);
        this.#handleMenuElement?.addEventListener('open', () => this.#handleElement.focus());
    }

    #onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            this.#handleElement.blur();
            this.#start();
        }
    }

    #onHandleSelected = (event: Event) => {
        const target = event.target as HTMLMenuElement;
        this.#handleElement.value = target.getAttribute('text') || this.#handleElement.value;
    }

    #onInput = async () => {
        const {data: { actors }} = await this.#bot.searchUsers(this.#handle);
        this.#popuplateMenu(actors);
    }

    #popuplateMenu(actors: ProfileViewBasic[]) {
        const menu = this.#handleMenuElement
        menu.toggleAttribute('open', actors.length > 0);
        const menuItems = menu.querySelectorAll('vwc-menu-item');
        menuItems.forEach((item, index) => {
            if (index < actors.length) {
                item.setAttribute('text', actors[index]['handle']);
                if (actors[index]['avatar']) item.querySelector('img')?.setAttribute('src', actors[index]['avatar']);
                item.classList.remove('hidden');
            } else {
                item.removeAttribute('text');
                item.classList.add('hidden');
            }            
        });
    }

    #start = async () => {
        if (!this.#handle) {
            return;
        }
        this.#altTextMeter.nTotal = 0;
        this.#altTextMeter.nAltLess = 0;
        this.#bot.run(this.#handle, this.#onStreamUpdate);
    }

    #onStreamUpdate = (result: BotPosts) => {
        this.#altTextMeter.nTotal += result.results.length;
        this.#altTextMeter.nAltLess += result.results.filter(result => result.imagesWithoutAlt.length).length;
    }
}