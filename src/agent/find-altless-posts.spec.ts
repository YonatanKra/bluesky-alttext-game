import { AltTextBot } from './find-altless-posts.js';

let mockAtpAgent;

const resolvedHandle = {
    did: 'handle-did'
};

const resetAtpAgentMock = () => {
    mockAtpAgent = {
        getPost: vi.fn(),
        resolveHandle: vi.fn().mockResolvedValue({
            data: resolvedHandle
        }),
        login: vi.fn(),
        getAuthorFeed: vi.fn(),
        searchActorsTypeahead: vi.fn()
    };
}

vi.mock('@atproto/api', () => ({
    AtpAgent: vi.fn(() => mockAtpAgent),
}));

describe('AltTextBot', () => {
    const postUri = 'postUri';
    const handle = 'testUser';
    const imageWithoutAlt = { alt: '' };
    const imageWithAlt = { alt: 'I have Alt text!' };

    const emptyFeedResponse = {
        data: {
            feed: [],
            cursor: undefined,
        },
    };

    const fullFeedResponse = {
        data: {
            feed: [
                {
                    post: {
                        uri: 'postUri1', cid: 'postCid1',
                        embed: {
                            images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                            $type: 'image'
                        },
                        record: {
                            text: 'text1',
                            createdAt: '1139872873',
                            embed: {
                                images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                                $type: 'image'
                            }
                        }
                    }
                },
                {
                    post: {
                        uri: 'postUri2', cid: 'postCid2',
                        embed: {
                            images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                            $type: 'image'
                        },
                        record: {
                            text: 'text2',
                            createdAt: '2139872873',
                            embed: {
                                images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                                $type: 'image'
                            }
                        }
                    }
                },
            ],
            cursor: 'nextCursor',
        },
    };

    const fullFeedResponseWithAlt = {
        data: {
            feed: [
                {
                    post: {
                        uri: 'postUri1', cid: 'postCid1',
                        embed: {
                            $type: 'image'
                        },
                        record: {
                            text: 'text1',
                            createdAt: '1139872873',
                            embed: {
                                $type: 'image'
                            }
                        }
                    }
                },
                {
                    post: {
                        uri: 'postUri2',
                        cid: 'postCid2',
                        embed: {
                            images: [imageWithAlt, imageWithAlt, imageWithAlt],
                            $type: 'image'
                        },
                        record: {
                            text: 'text2',
                            createdAt: '2139872873',
                            embed: {
                                images: [imageWithAlt, imageWithAlt, imageWithAlt],
                                $type: 'image'
                            },
                            $type: 'image'
                        }
                    }
                },
            ],
            cursor: 'nextCursor',
        },
    };

    const fullFeedLastResponse = {
        data: {
            feed: [
                {
                    post: {
                        uri: 'postUri1', cid: 'postCid1', embed: {
                            images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                            $type: 'image'
                        },
                        record: {
                            text: 'text1',
                            createdAt: '1139872873',
                            embed: {
                                images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                                $type: 'image'
                            }
                        }
                    }
                },
                {
                    post: {
                        uri: 'postUri2', cid: 'postCid2', embed: {
                            images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                            $type: 'image'
                        },
                        record: {
                            text: 'text2',
                            createdAt: '2139872873',
                            embed: {
                                images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                                $type: 'image'
                            }
                        }
                    }
                },
            ]
        },
    };

    let bot: AltTextBot;

    function queueAgentFeedResponse(response) {
        mockAtpAgent.getAuthorFeed.mockResolvedValueOnce(response);
    }

    beforeEach(async () => {
        resetAtpAgentMock();
        bot = new AltTextBot();
    });

    it('should initialize a new instance', async () => {
        expect(bot).toBeDefined();
    });

    describe('checkSinglePost()', () => {
        it('should return the error message if fetch post failed', async () => {
            const error = { message: 'error' };
            mockAtpAgent.getPost.mockRejectedValue(error);

            const result = await bot.checkSinglePost(postUri);

            expect(result).toEqual(error);
        });

        it('should get the post using atpAgent', async () => {
            const postUri = 'https://bsky.app/profile/yonatankra.com/post/3lczalvz7uk2l';
            mockAtpAgent.getPost.mockResolvedValueOnce(postUri);

            await bot.checkSinglePost(postUri);

            expect(mockAtpAgent.getPost).toHaveBeenCalledWith({
                "collection": "app.bsky.feed.post",
                "repo": "handle-did",
                "rkey": "3lczalvz7uk2l",
            });
            expect(mockAtpAgent.getPost).toHaveBeenCalledTimes(1);
        });

        it('should return the post with altLess images list', async () => {
            const post = {
                uri: 'postUri',
                cid: 'postCid',
                value: {
                    embed: {
                        images: [imageWithoutAlt, imageWithAlt, imageWithoutAlt],
                        $type: 'image'
                    },
                    text: '',
                    createdAt: ''
                },
            };

            mockAtpAgent.getPost.mockResolvedValueOnce(post);

            const result = await bot.checkSinglePost(postUri);

            expect(result).toEqual({ post, imagesWithoutAlt: [imageWithoutAlt, imageWithoutAlt] })
        });
    });

    describe('login()', () => {
        it('should login using AtProto SDK', async () => {
            const handle = 'testUser';
            const password = 'testPassword';

            await bot.login(handle, password);
            expect(mockAtpAgent.login).toHaveBeenCalledWith({
                identifier: handle,
                password: password,
            });
        });
    });

    describe('streamPosts()', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should call getAuthorFeed with the correct parameters', async () => {
            queueAgentFeedResponse(emptyFeedResponse);
            await bot.streamPosts(handle, () => { });

            expect(mockAtpAgent.getAuthorFeed.mock.calls[0][0]).toEqual({
                actor: handle,
                limit: 20,
                cursor: undefined,
                filter: 'posts_with_media'
            });
        });

        it('should log when there are no more posts and break', async () => {
            queueAgentFeedResponse(emptyFeedResponse);

            await bot.streamPosts(handle, () => { });

            expect(mockAtpAgent.getAuthorFeed).toHaveBeenCalledTimes(1);
        });

        it('should break if no cursor is provided in the feed response', async () => {
            queueAgentFeedResponse({
                data: {
                    feed: [
                        { post: { uri: 'postUri1', cid: 'postCid1', embed: {} } },
                        { post: { uri: 'postUri2', cid: 'postCid2', embed: {} } },
                    ],
                    cursor: undefined
                }
            });

            await bot.streamPosts(handle, () => { });

            expect(mockAtpAgent.getAuthorFeed).toHaveBeenCalledTimes(1);
        });

        it('should retry after 5 seconds if author feed rejected', async () => {
            vi.useFakeTimers();
            const fetchError = new Error('Fetch error');
            mockAtpAgent.getAuthorFeed.mockRejectedValueOnce(fetchError);

            bot.streamPosts(handle, () => { });
            await vi.advanceTimersByTimeAsync(4999);
            const callsBefore5Seconds = mockAtpAgent.getAuthorFeed.mock.calls.length;

            await vi.advanceTimersByTimeAsync(1);

            expect(callsBefore5Seconds).toBe(1);
            expect(mockAtpAgent.getAuthorFeed).toHaveBeenCalledTimes(2);
            vi.useRealTimers();
        });

        it('should stream posts with done set to false when cursor is truthy', async () => {
            const spy = vi.fn();
            queueAgentFeedResponse(fullFeedResponse);
            queueAgentFeedResponse(fullFeedResponse);
            queueAgentFeedResponse(fullFeedLastResponse);


            await bot.streamPosts(handle, spy);

            expect(spy.mock.calls[0][0])
                .toEqual({ result: fullFeedResponse.data.feed, done: false });
            expect(spy.mock.calls[1][0])
                .toEqual({ result: fullFeedResponse.data.feed, done: false });
            expect(spy.mock.calls[2][0])
                .toEqual({ result: fullFeedLastResponse.data.feed, done: true });
        });


        it('should send done true to callback when response cursor is empty', async () => {
            const spy = vi.fn();
            queueAgentFeedResponse(fullFeedLastResponse);

            await bot.streamPosts(handle, spy);

            expect(spy.mock.calls[0][0])
                .toEqual({ result: fullFeedLastResponse.data.feed, done: true });
        });


        it('should send done true to callback when feed returns empty', async () => {
            const spy = vi.fn();
            queueAgentFeedResponse(emptyFeedResponse);

            await bot.streamPosts(handle, spy);

            expect(spy.mock.calls[0][0]).toEqual({ done: true });
        });

        it('should send the last response cursor in the next request', async () => {
            const spy = vi.fn();
            queueAgentFeedResponse({ data: { ...fullFeedResponse.data, cursor: 'next-0' } });
            queueAgentFeedResponse({ data: { ...fullFeedResponse.data, cursor: 'next-1' } });
            queueAgentFeedResponse(fullFeedLastResponse);

            await bot.streamPosts(handle, spy);

            expect(mockAtpAgent.getAuthorFeed.mock.calls[1][0].cursor).toBe('next-0');
            expect(mockAtpAgent.getAuthorFeed.mock.calls[2][0].cursor).toBe('next-1');
            expect(mockAtpAgent.getAuthorFeed).toHaveBeenCalledTimes(3);
        });
    });

    describe('run()', () => {

        it('should fire the callback on every streaming event', async () => {
            queueAgentFeedResponse(fullFeedResponse);
            queueAgentFeedResponse(fullFeedLastResponse);
            const spy = vi.fn();
            await bot.run(handle, spy);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('should send parsed output to the callback', async () => {
            queueAgentFeedResponse(fullFeedResponseWithAlt);
            queueAgentFeedResponse(fullFeedLastResponse);
            const spy = vi.fn();
            await bot.run(handle, spy);

            expect(spy.mock.calls[0][0]).toEqual({
                results: [
                    {
                        imagesWithoutAlt: [],
                        text: 'text1',
                        createdAt: fullFeedResponseWithAlt.data.feed[0].post.record?.createdAt
                    },
                    {
                        imagesWithoutAlt: [],
                        text: 'text2',
                        createdAt: fullFeedResponseWithAlt.data.feed[1].post.record?.createdAt
                    },
                ],
                done: false
            });
            expect(spy.mock.calls[1][0]).toEqual({
                results: [
                    {
                        imagesWithoutAlt: [imageWithoutAlt, imageWithoutAlt],
                        text: 'text1',
                        createdAt: fullFeedLastResponse.data.feed[0].post.record?.createdAt
                    },
                    {
                        imagesWithoutAlt: [imageWithoutAlt, imageWithoutAlt],
                        text: 'text2',
                        createdAt: fullFeedLastResponse.data.feed[1].post.record?.createdAt
                    },
                ],
                done: true
            });
        });
    });

    describe('searchUsers()', () => {
        it('should search for users with a given string', async () => {
            const searchString = 'test';
            await bot.searchUsers(searchString);
            expect(mockAtpAgent.searchActorsTypeahead).toHaveBeenCalledWith({q: searchString});
        });
    });

});