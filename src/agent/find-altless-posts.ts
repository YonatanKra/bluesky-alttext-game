import { AtpAgent } from "@atproto/api";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";

export interface BotPost {
    imagesWithoutAlt: any[];
    text: string;
    createdAt: string;
}

export interface BotPosts {
    results: BotPost[],
    done: Boolean;
}

export class AltTextBot {
    async searchUsers(searchString: string) {
        return this.#agent.searchActorsTypeahead({q: searchString});
    }
    
    #agent: AtpAgent = new AtpAgent({ service: 'https://public.api.bsky.app' });
    #returnPostWithAltlessImages(post: { uri: string; cid: string; value: Record; }) {
        const images = post.value?.embed?.images || [];
        const imagesWithoutAlt = images.filter(img => !img.alt);
        return { post, imagesWithoutAlt };
    }

    async checkSinglePost(postUri: string) {
        try {
            const post = await this.#agent.getPost(await parsePostUri(postUri, this.#agent));
            return this.#returnPostWithAltlessImages(post);
        } catch (e) {
            return e;
        }
    }

    async login(handle: string, password: string): Promise<void> {
        await this.#agent.login({
            identifier: handle,
            password: password
        });
    }

    async streamPosts(handle: string, onUpdate: (results: any) => any) {
        let cursor: any | undefined = undefined;
        
        while (true) {
            try {
                const result = await this.#agent.getAuthorFeed({
                    actor: handle,
                    limit: 20,
                    cursor,
                    filter: 'posts_with_media'
                });

                if (!result.data?.feed?.length) {
                    console.log('No more posts');
                    onUpdate({ done: true });
                    break;
                }

                onUpdate({result: result.data.feed, done: !result.data.cursor});

                if (!result.data.cursor) {
                    break;
                }

                cursor = result.data.cursor;

            } catch (e) {
                await new Promise(res => setTimeout(res, 5000));
            }
        }
    }

    #parseStreamData = (result) => result.map(({post: { record: { text, createdAt, embed} }}) => {
        const res = {
            text: text,
            createdAt: createdAt,
            imagesWithoutAlt: embed.images ? embed.images.filter(img => !img.alt) : []
        };
        return res;
    });

    async run(handle, callback: (results: BotPosts) => any) {
        await this.streamPosts(handle, ({result, done}) => {
            const parsedData = {
                results: this.#parseStreamData(result),
                done
            };
            callback(parsedData);
        });
    }
}

async function parsePostUri(uri: string, agent: AtpAgent): Promise<{ repo: string; collection: string; rkey: string; }> {
    // Extract handle and post ID
    const match = uri.match(/profile\/([^/]+)\/post\/([^/]+)/);
    if (!match) {
        return {
            repo: '',
            collection: '',
            rkey: '',
        };
    }
    const [, handle, rkey] = match;

    // Get the did
    const { data: { did: repo } } = await agent.resolveHandle({ handle });

    // Use the official bsky app
    const collection = 'app.bsky.feed.post';

    return {
        repo,
        collection,
        rkey
    };
}