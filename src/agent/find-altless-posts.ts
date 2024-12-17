import { AtpAgent } from "@atproto/api";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";

export class AltTextBot {
    #agent: AtpAgent = new AtpAgent({ service: 'https://bsky.social' });
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
        while (true) {
            try {
                const result = await this.#agent.getAuthorFeed({
                    actor: handle,
                    limit: 20,
                    cursor: undefined,
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

            } catch (e) {
                await new Promise(res => setTimeout(res, 5000));
            }
        }
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