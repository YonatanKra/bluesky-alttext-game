import { BotPosts } from '../agent/find-altless-posts';
import { AltTextMeter } from './alt-text-meter/alt-text-meter';
import { App } from './app';

global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

HTMLElement.prototype.showPopover = vi.fn();
HTMLElement.prototype.hidePopover = vi.fn();

let botMock;

const resetBotMock = () => {
    botMock = {
        run: vi.fn(),
        streamPosts: vi.fn(),
        searchUsers: vi.fn(),
    };
}

vi.mock('../agent/find-altless-posts.ts', () => ({
    AltTextBot: vi.fn(() => botMock),
}));

const ELEMENT_NAME = 'app-element';
describe('App', () => {
    function startButtonClick(app: App, mockHandle?: string) {
        const handleField = getHandleField();
        handleField.value = mockHandle as string;
        const loginButton = app.shadowRoot?.querySelector('#start-button') as HTMLButtonElement;
        loginButton.click();
        return handleField;
    }

    function getHandleMenu() {
        return app.shadowRoot?.querySelector('#handle-menu') as HTMLSelectElement;
    }

    function getHandleField() {
        return app.shadowRoot?.querySelector('[name="handle"]') as HTMLInputElement;
    }

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

    it('should call bot run with handle when hitting enter key', async () => {
        botMock.searchUsers.mockResolvedValue({ data: { actors: [] } });
        const handleField = getHandleField();
        handleField.value = 'mockHandle';
        handleField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(botMock.run).toHaveBeenCalledWith('mockHandle', expect.any(Function));
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
                    createdAt: '2'
                },
                {
                    imagesWithoutAlt: ['image1'],
                    text: '',
                    createdAt: '1'
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
                    createdAt: '1'
                },
                {
                    imagesWithoutAlt: [],
                    text: '',
                    createdAt: '2'
                },
                {
                    imagesWithoutAlt: ['altLess'],
                    text: '',
                    createdAt: '3'
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

    describe('user search feature', () => {
        it('should init a menu with five hidden menu items', async () => {
            const handleMenu = getHandleMenu();
            expect(handleMenu.querySelectorAll('vwc-menu-item.hidden').length).toBe(5);
            expect(handleMenu.querySelectorAll('vwc-menu-item').length).toBe(5);
        });

        it('should add open attribute after results arrived', async () => {
            const resolvedUsers = {
                data: {
                    "actors": [
                        {
                            "did": "string",
                            "handle": "string",
                            "displayName": "string",
                            "avatar": "string",
                            "associated": {
                                "lists": 0,
                                "feedgens": 0,
                                "starterPacks": 0,
                                "labeler": true,
                                "chat": {
                                    "allowIncoming": "all"
                                }
                            },
                            "viewer": {
                                "muted": true,
                                "mutedByList": {
                                    "uri": "string",
                                    "cid": "string",
                                    "name": "string",
                                    "purpose": "string",
                                    "avatar": "string",
                                    "listItemCount": 0,
                                    "labels": [
                                        {
                                            "ver": 0,
                                            "src": "string",
                                            "uri": "string",
                                            "cid": "string",
                                            "val": "string",
                                            "neg": true,
                                            "cts": "2024-07-29T15:51:28.071Z",
                                            "exp": "2024-07-29T15:51:28.071Z",
                                            "sig": "string"
                                        }
                                    ],
                                    "viewer": {
                                        "muted": true,
                                        "blocked": "string"
                                    },
                                    "indexedAt": "2024-07-29T15:51:28.071Z"
                                },
                                "blockedBy": true,
                                "blocking": "string",
                                "blockingByList": {
                                    "uri": "string",
                                    "cid": "string",
                                    "name": "string",
                                    "purpose": "string",
                                    "avatar": "string",
                                    "listItemCount": 0,
                                    "labels": [
                                        {
                                            "ver": 0,
                                            "src": "string",
                                            "uri": "string",
                                            "cid": "string",
                                            "val": "string",
                                            "neg": true,
                                            "cts": "2024-07-29T15:51:28.071Z",
                                            "exp": "2024-07-29T15:51:28.071Z",
                                            "sig": "string"
                                        }
                                    ],
                                    "viewer": {
                                        "muted": true,
                                        "blocked": "string"
                                    },
                                    "indexedAt": "2024-07-29T15:51:28.071Z"
                                },
                                "following": "string",
                                "followedBy": "string",
                                "knownFollowers": {
                                    "count": 0,
                                    "followers": [
                                        null
                                    ]
                                }
                            },
                            "labels": [
                                {
                                    "ver": 0,
                                    "src": "string",
                                    "uri": "string",
                                    "cid": "string",
                                    "val": "string",
                                    "neg": true,
                                    "cts": "2024-07-29T15:51:28.071Z",
                                    "exp": "2024-07-29T15:51:28.071Z",
                                    "sig": "string"
                                }
                            ],
                            "createdAt": "2024-07-29T15:51:28.071Z"
                        },
                        {},
                        {}
                    ]
                }
            };

            botMock.searchUsers.mockResolvedValue(resolvedUsers);
            const handleMenu = getHandleMenu();
            const handleField = getHandleField();
            handleField.value = 'mockHandle';

            handleField.dispatchEvent(new Event('input'));
            await Promise.resolve();

            expect(handleMenu.hasAttribute('open')).toBe(true);
        });

        it('should remove open attribute from menu if empty results arrived', async () => {
            botMock.searchUsers.mockResolvedValue({ data: { actors: [] } });
            const handleMenu = getHandleMenu();
            const handleField = getHandleField();
            handleField.value = 'mockHandle';

            handleField.dispatchEvent(new Event('input'));
            await Promise.resolve();

            expect(handleMenu.hasAttribute('open')).toBe(false);
        });

        it('should unhide and hide menu items according to searched actors', async () => {
            const resolvedUsers = {
                data: {
                    "actors": [
                        {
                            "did": "string",
                            "handle": "string",
                            "displayName": "string",
                            "avatar": "string",
                            "associated": {
                                "lists": 0,
                                "feedgens": 0,
                                "starterPacks": 0,
                                "labeler": true,
                                "chat": {
                                    "allowIncoming": "all"
                                }
                            },
                            "viewer": {
                                "muted": true,
                                "mutedByList": {
                                    "uri": "string",
                                    "cid": "string",
                                    "name": "string",
                                    "purpose": "string",
                                    "avatar": "string",
                                    "listItemCount": 0,
                                    "labels": [
                                        {
                                            "ver": 0,
                                            "src": "string",
                                            "uri": "string",
                                            "cid": "string",
                                            "val": "string",
                                            "neg": true,
                                            "cts": "2024-07-29T15:51:28.071Z",
                                            "exp": "2024-07-29T15:51:28.071Z",
                                            "sig": "string"
                                        }
                                    ],
                                    "viewer": {
                                        "muted": true,
                                        "blocked": "string"
                                    },
                                    "indexedAt": "2024-07-29T15:51:28.071Z"
                                },
                                "blockedBy": true,
                                "blocking": "string",
                                "blockingByList": {
                                    "uri": "string",
                                    "cid": "string",
                                    "name": "string",
                                    "purpose": "string",
                                    "avatar": "string",
                                    "listItemCount": 0,
                                    "labels": [
                                        {
                                            "ver": 0,
                                            "src": "string",
                                            "uri": "string",
                                            "cid": "string",
                                            "val": "string",
                                            "neg": true,
                                            "cts": "2024-07-29T15:51:28.071Z",
                                            "exp": "2024-07-29T15:51:28.071Z",
                                            "sig": "string"
                                        }
                                    ],
                                    "viewer": {
                                        "muted": true,
                                        "blocked": "string"
                                    },
                                    "indexedAt": "2024-07-29T15:51:28.071Z"
                                },
                                "following": "string",
                                "followedBy": "string",
                                "knownFollowers": {
                                    "count": 0,
                                    "followers": [
                                        null
                                    ]
                                }
                            },
                            "labels": [
                                {
                                    "ver": 0,
                                    "src": "string",
                                    "uri": "string",
                                    "cid": "string",
                                    "val": "string",
                                    "neg": true,
                                    "cts": "2024-07-29T15:51:28.071Z",
                                    "exp": "2024-07-29T15:51:28.071Z",
                                    "sig": "string"
                                }
                            ],
                            "createdAt": "2024-07-29T15:51:28.071Z"
                        },
                        {},
                        {}
                    ]
                }
            };

            botMock.searchUsers.mockResolvedValue(resolvedUsers);
            const handleMenu = getHandleMenu();
            const handleField = getHandleField();
            handleField.value = 'mockHandle';

            handleField.dispatchEvent(new Event('input'));
            await Promise.resolve();

            expect(botMock.searchUsers).toHaveBeenCalledWith('mockHandle');
            expect(handleMenu.querySelector('#menu-item-1')?.classList.contains('hidden')).toBe(false);
            expect(handleMenu.querySelector('#menu-item-2')?.classList.contains('hidden')).toBe(false);
            expect(handleMenu.querySelector('#menu-item-3')?.classList.contains('hidden')).toBe(false);
            expect(handleMenu.querySelector('#menu-item-4')?.classList.contains('hidden')).toBe(true);
            expect(handleMenu.querySelector('#menu-item-5')?.classList.contains('hidden')).toBe(true);
        });

        it('should populate the relevant items with the handle', async () => {
            const resolvedUsers = {
                data: {
                    "actors": [
                        {
                            "did": "string",
                            "handle": "string",
                            "displayName": "string",
                            "avatar": "string",
                            "associated": {
                                "lists": 0,
                                "feedgens": 0,
                                "starterPacks": 0,
                                "labeler": true,
                                "chat": {
                                    "allowIncoming": "all"
                                }
                            },
                            "viewer": {
                                "muted": true,
                                "mutedByList": {
                                    "uri": "string",
                                    "cid": "string",
                                    "name": "string",
                                    "purpose": "string",
                                    "avatar": "string",
                                    "listItemCount": 0,
                                    "labels": [
                                        {
                                            "ver": 0,
                                            "src": "string",
                                            "uri": "string",
                                            "cid": "string",
                                            "val": "string",
                                            "neg": true,
                                            "cts": "2024-07-29T15:51:28.071Z",
                                            "exp": "2024-07-29T15:51:28.071Z",
                                            "sig": "string"
                                        }
                                    ],
                                    "viewer": {
                                        "muted": true,
                                        "blocked": "string"
                                    },
                                    "indexedAt": "2024-07-29T15:51:28.071Z"
                                },
                                "blockedBy": true,
                                "blocking": "string",
                                "blockingByList": {
                                    "uri": "string",
                                    "cid": "string",
                                    "name": "string",
                                    "purpose": "string",
                                    "avatar": "string",
                                    "listItemCount": 0,
                                    "labels": [
                                        {
                                            "ver": 0,
                                            "src": "string",
                                            "uri": "string",
                                            "cid": "string",
                                            "val": "string",
                                            "neg": true,
                                            "cts": "2024-07-29T15:51:28.071Z",
                                            "exp": "2024-07-29T15:51:28.071Z",
                                            "sig": "string"
                                        }
                                    ],
                                    "viewer": {
                                        "muted": true,
                                        "blocked": "string"
                                    },
                                    "indexedAt": "2024-07-29T15:51:28.071Z"
                                },
                                "following": "string",
                                "followedBy": "string",
                                "knownFollowers": {
                                    "count": 0,
                                    "followers": [
                                        null
                                    ]
                                }
                            },
                            "labels": [
                                {
                                    "ver": 0,
                                    "src": "string",
                                    "uri": "string",
                                    "cid": "string",
                                    "val": "string",
                                    "neg": true,
                                    "cts": "2024-07-29T15:51:28.071Z",
                                    "exp": "2024-07-29T15:51:28.071Z",
                                    "sig": "string"
                                }
                            ],
                            "createdAt": "2024-07-29T15:51:28.071Z"
                        },
                        {
                            "handle": "mockHandle",
                        },
                        {
                            "handle": "mockHandle2",
                        }
                    ]
                }
            };

            botMock.searchUsers.mockResolvedValue(resolvedUsers);
            const handleMenu = getHandleMenu();
            const handleField = getHandleField();
            handleField.value = 'mockHandle';

            handleField.dispatchEvent(new Event('input'));
            await Promise.resolve();

            expect(botMock.searchUsers).toHaveBeenCalledWith('mockHandle');
            expect(handleMenu.querySelector('#menu-item-1')?.getAttribute('text')).toBe('string');
            expect(handleMenu.querySelector('#menu-item-2')?.getAttribute('text')).toBe('mockHandle');
            expect(handleMenu.querySelector('#menu-item-3')?.getAttribute('text')).toBe('mockHandle2');
            expect(handleMenu.querySelector('#menu-item-4')?.getAttribute('text')).toBeNull();
            expect(handleMenu.querySelector('#menu-item-5')?.getAttribute('text')).toBeNull();
        });

        it('should populate the handle field with selected value from the menu when item selected', async () => {
            const handleMenu = getHandleMenu();
            const handleField = getHandleField();
            const menuItem = handleMenu.querySelector('#menu-item-1') as HTMLSelectElement;
            await new Promise(res => requestAnimationFrame(res));
            menuItem.setAttribute('text', 'mockHandle');
            menuItem.click();
            expect(handleField.value).toBe('mockHandle');
        });

        it('should leave the handle field value as is if click event is not from a menu item', async () => {
            const handleMenu = getHandleMenu();
            const handleField = getHandleField();
            handleField.value = 'mockHandle';
            handleMenu.click();
            expect(handleField.value).toBe('mockHandle');
        });

        it('should research when focusing on the input field', async () => {
            botMock.searchUsers.mockResolvedValue({ data: { actors: [] } });
            const handleField = getHandleField();
            handleField.value = 'mockHandle';
            handleField.dispatchEvent(new Event('focus'));
            expect(botMock.searchUsers).toHaveBeenCalledWith('mockHandle');
        });

        it('should set the user avatar in the menu item meta slot', async () => {
            const resolvedValue = {
                data: {
                    actors: [
                        {
                            handle: 'mockHandle',
                            avatar: 'mockAvatar'
                        }
                    ]
                }
            };
            botMock.searchUsers.mockResolvedValue(resolvedValue);
            const handleMenu = getHandleMenu();
            const handleField = getHandleField();
            handleField.dispatchEvent(new Event('input'));
            await Promise.resolve();
            const menuItem = handleMenu.querySelector('#menu-item-1') as HTMLSelectElement;
            expect(menuItem.querySelector('img[slot="meta"')?.getAttribute('src')).toBe('mockAvatar');
        });
    });

    describe('startTime', () => {
        it('should default to 0', async () => {
            expect(app.startTime).toBe(0);
            expect(app.getAttribute('start-time')).toBe('0');
        });

        it('should reflect to end-time attribute', async () => {
            app.startTime = 50;
            expect(app.getAttribute('start-time')).toBe('50');
        });

        it('should reflect attribute to endTime property', async () => {
            app.setAttribute('start-time', '50');
            expect(app.startTime).toBe(50);
        });

        it('should calculate the total and altLess according to selected time', async () => {
            const altTextMeter = app.shadowRoot?.querySelector('alt-text-meter') as AltTextMeter;
            startButtonClick(app, 'mockHandle');
            const streamCallback = botMock.run.mock.calls[0][1];

            const input1: BotPosts = {
                results: [
                    {
                        imagesWithoutAlt: [],
                        text: '',
                        createdAt: '2024-12-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2024-06-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2023-12-25T19:19:46.560Z'
                    }
                ],
                done: false
            };

            streamCallback(input1);
            streamCallback(input1);

            app.startTime = 50;

            expect(altTextMeter.nAltLess).toBe(2);
            expect(altTextMeter.nTotal).toBe(4);
        });

        it('should use the set endTime for new data', async () => {
            const altTextMeter = app.shadowRoot?.querySelector('alt-text-meter') as AltTextMeter;
            startButtonClick(app, 'mockHandle');
            const streamCallback = botMock.run.mock.calls[0][1];

            const input1: BotPosts = {
                results: [
                    {
                        imagesWithoutAlt: [],
                        text: '',
                        createdAt: '2024-12-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2024-06-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2023-12-25T19:19:46.560Z'
                    }
                ],
                done: false
            };

            app.startTime = 50;

            streamCallback(input1);
            streamCallback(input1);

            expect(altTextMeter.nAltLess).toBe(2);
            expect(altTextMeter.nTotal).toBe(4);

        });
    });
    describe('endTime', () => {
        it('should default to 100', async () => {
            expect(app.endTime).toBe(100);
            expect(app.getAttribute('end-time')).toBe('100');
        });

        it('should reflect to end-time attribute', async () => {
            app.endTime = 50;
            expect(app.getAttribute('end-time')).toBe('50');
        });

        it('should reflect attribute to endTime property', async () => {
            app.setAttribute('end-time', '50');
            expect(app.endTime).toBe(50);
        });

        it('should calculate the total and altLess according to selected time', async () => {
            const altTextMeter = app.shadowRoot?.querySelector('alt-text-meter') as AltTextMeter;
            startButtonClick(app, 'mockHandle');
            const streamCallback = botMock.run.mock.calls[0][1];

            const input1: BotPosts = {
                results: [
                    {
                        imagesWithoutAlt: [],
                        text: '',
                        createdAt: '2024-12-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2024-06-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2023-12-25T19:19:46.560Z'
                    }
                ],
                done: false
            };

            streamCallback(input1);
            streamCallback(input1);

            app.endTime = 50;

            expect(altTextMeter.nAltLess).toBe(4);
            expect(altTextMeter.nTotal).toBe(4);
        });

        it('should use the set endTime for new data', async () => {
            const altTextMeter = app.shadowRoot?.querySelector('alt-text-meter') as AltTextMeter;
            startButtonClick(app, 'mockHandle');
            const streamCallback = botMock.run.mock.calls[0][1];

            const input1: BotPosts = {
                results: [
                    {
                        imagesWithoutAlt: [],
                        text: '',
                        createdAt: '2024-12-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2024-06-25T19:19:46.560Z'
                    },
                    {
                        imagesWithoutAlt: ['image1'],
                        text: '',
                        createdAt: '2023-12-25T19:19:46.560Z'
                    }
                ],
                done: false
            };

            app.endTime = 50;

            streamCallback(input1);
            streamCallback(input1);

            expect(altTextMeter.nAltLess).toBe(4);
            expect(altTextMeter.nTotal).toBe(4);

        });
    });
});


