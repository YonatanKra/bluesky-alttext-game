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
        login: vi.fn()
    };
}

vi.mock('@atproto/api', () => ({
    AtpAgent: vi.fn(() => mockAtpAgent),
}));

describe('AltTextBot', () => {
    const postUri = 'postUri';
    let bot: AltTextBot;

    beforeEach(async () => {
        resetAtpAgentMock();
        bot = new AltTextBot();
    });

    it('should initialize a new instance', async () => {
        expect(bot).toBeDefined();
    });

    describe('checkAltInSinglePost()', () => {
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
            const imageWithoutAlt = { alt: '' };
            const imageWithAlt = { alt: 'I have Alt text!' };
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

    describe('login', () => {
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
});