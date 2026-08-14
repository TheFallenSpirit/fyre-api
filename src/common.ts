import { Redis } from 'ioredis';
import { seconds } from 'itty-time';
import { ApiHandler } from 'seyfert';
import { RESTPostAPIChannelMessageJSONBody } from 'seyfert/lib/types/index.js';

export const dev = process.argv.includes('--dev');
export const redis = new Redis(process.env.REDIS_URL ?? '');
export const discord = new ApiHandler({ token: process.env.DISCORD_TOKEN ?? '' }).proxy;

export const productKeys = {
	[dev ? "18995f5c-cf3d-4800-ba41-021e2ec4298f" : "d9ac98b3-b736-421a-95a7-47cc8d1dd96f"]: 'user-license',
    [dev ? "4ae392e6-e3b5-4d73-ba3b-208c8aba67d2" : "128d9df3-bb7b-4de1-a012-3ad10aa2eb4f"]: 'guild-license',
	[dev ? "034edb95-ff1f-472f-8b6f-d066963e466f" : "a1a92ae3-d685-4f32-b3bd-f56e05c4f0d9"]: 'proxy-subscription'
};

export const docsUrl = '[Fyre Docs](<https://fyre.bot/docs>)';
export const fyreHub = '[Fyre Hub](https://discord.gg/SNxqD4ujTF)';
export const defaultColor = 0x249fe6;
export const logsChannelId = '1537292594013540405';

export async function sendDM(userId: string, body: RESTPostAPIChannelMessageJSONBody) {
    let channelId = await redis.get(`fs_dm_channel:${userId}`);

    if (!channelId) {
        const channel = await discord.users('@me').channels.post({ body: { recipient_id: userId } }).catch(() => {});
        if (!channel) return;
        
        channelId = channel.id;
        await redis.set(`fs_dm_channel:${userId}`, channelId, 'EX', seconds('1 week'));
    };

    await discord.channels(channelId).messages.post({ body }).catch(() => {});
};
