import { AltTextBot, type BotPost, type BotPosts } from '../agent/find-altless-posts';
import { AltTextMeter } from './alt-text-meter/alt-text-meter';
import template from './app.template.html?raw';
import '@vonage/vivid/button';
import '@vonage/vivid/progress';
import '@vonage/vivid/text-field';
import '@vonage/vivid/card';
import '@vonage/vivid/header';
import '@vonage/vivid/menu';
import '@vonage/vivid/range-slider';
import { type RangeSlider } from '@vonage/vivid/range-slider';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

function defineElements() {
    customElements.define('alt-text-meter', AltTextMeter);
}

defineElements();

export class App extends HTMLElement {
    static get observedAttributes() {
        return ['end-time', 'start-time'];
    }

    attributeChangedCallback(name: string, _: string, newValue: string) {
        if (name === 'end-time') {
            this.#endTime = Number(newValue);
            this.#updateDataByTime();
        }
        if (name === 'start-time') {
            this.#startTime = Number(newValue);
            this.#updateDataByTime();
        }
    }

    #startTime = 0;
    get startTime() {
        return this.#startTime;
    }

    set startTime(value: number) {
        this.setAttribute('start-time', value.toString());
    }

    #endTime = 100;

    get endTime() {
        return this.#endTime;
    }

    set endTime(value: number) {
        this.setAttribute('end-time', value.toString());
    }

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

    get #rangeSlider() {
        return this.shadowRoot?.querySelector('#range-slider') as RangeSlider;
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
        this.#rangeSlider?.addEventListener('change', (event) => {
            this.endTime = this.#rangeSlider.end;
            this.startTime = this.#rangeSlider.start;
        });
    }

    connectedCallback() {
        this.#syncStartAndEndTime();
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
        this.#data.length = 0;
        this.#altTextMeter.nTotal = 0;
        this.#altTextMeter.nAltLess = 0;
        this.#bot.run(this.#handle, this.#onStreamUpdate);
    }

    #data: BotPost[] = [];

    #updateDataByTime() {
        if (!this.#data.length) {
            return;
        }
        const { cutOffEndDate, cutOffStartDate } = getCutoffDates(getMinMaxDates(this.#data), this.#endTime, this.#startTime);
        this.#altTextMeter.nTotal = 0;
        this.#altTextMeter.nAltLess = 0;
        this.#updateAltTextMeter(this.#data.filter(data => {
            const postDate = new Date(data.createdAt).getTime();
            return postDate <= cutOffEndDate && postDate >= cutOffStartDate;
        }));
    }

    #updateAltTextMeter = (result: BotPost[]) => {
        this.#altTextMeter.nTotal += result.length;
        this.#altTextMeter.nAltLess += result.filter(result => result.imagesWithoutAlt.length).length;
    }

    #onStreamUpdate = (result: BotPosts) => {
        this.#data = [...this.#data, ...result.results];
        this.#updateDataByTime();
    }

    #syncStartAndEndTime() {
        this.setAttribute('end-time', this.#endTime.toString());
        this.setAttribute('start-time', this.#startTime.toString());
    }
}

function getMinMaxDates(posts: BotPost[]) {
    const createdAtValues = posts.map(post => new Date(post.createdAt).getTime());
    const firstPostDate = new Date(Math.min(...createdAtValues)).getTime();
    const latestPostDate = new Date(Math.max(...createdAtValues)).getTime();
    return { firstPostDate, latestPostDate };
}

function getCutoffDates({latestPostDate, firstPostDate}, endTime, startTime) {
    const diff = latestPostDate - firstPostDate;
    const cutOffEndDate = latestPostDate - diff * (100 - endTime) / 100;
    const cutOffStartDate = latestPostDate - diff * (100 - startTime) / 100;
    return { cutOffEndDate, cutOffStartDate };
}