import got from 'got';
import { ApiClient } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID ?? '';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET ?? '';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? '';

const THALNOSTV_ID = '58348024';
const ZBEULMAKER_ID = '131946266';

(async () => {

    const twitchAuthProvider = new ClientCredentialsAuthProvider(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);

    const twitchApiClient = new ApiClient({
        authProvider: twitchAuthProvider,
    });

    const twitchChatClient = ChatClient.anonymous({
        readOnly: true,
        requestMembershipEvents: false,
        channels: ['thalnostv', 'zbeulmaker'],
    });
    await twitchChatClient.connect();

    console.log('Twitch chat client connected');

    twitchChatClient.onAuthenticationFailure(async (message) => {
        console.error(`Authentication failure: ${message}`);
        twitchChatClient.removeListener(messageListener);
        await twitchChatClient.quit();
    });

    twitchChatClient.onNoPermission(async (channel, message) => {
        console.error(`No permission on channel ${channel}: ${message}`);
        twitchChatClient.removeListener(messageListener);
        await twitchChatClient.quit();
    });

    const messageListener = twitchChatClient.onMessage(async (channel, user, message) => {
        const messageMatch = message.match(/https:\/\/(?:clips|www)\.twitch\.tv\/(?:(?:[a-z]+)\/clip\/)?([a-zA-Z0-9\-]+)/);

        if (messageMatch != null && messageMatch.length > 1) {
            try {
                const clip = await twitchApiClient.helix.clips.getClipById(messageMatch[1]) || null;

                if (clip === null) {
                    throw new Error('Clip not found');
                }

                if (clip.broadcasterId !== THALNOSTV_ID) {
                    throw new Error('Clip from other streamer');
                }

                const gameName = (await clip.getGame())?.name ?? 'Autre';

                if (channel === '#thalnostv') {
                    const webhookResponse = await got.post(DISCORD_WEBHOOK_URL, {
                        json: {
                            content: `[${gameName}] ${clip.url}`,
                        },
                        responseType: 'json',
                    });
                    console.log(webhookResponse.body);
                    console.log(`[${channel}, ${user}, published][${gameName}] ${clip.url}`);
                } else {
                    console.log(`[${channel}, ${user}, not published][${gameName}] ${clip.url}`);
                }

            } catch (error) {
                console.error(error);
            }
        }
    });

    process.once('beforeExit', async () => {
        twitchChatClient.removeListener(messageListener);
        await twitchChatClient.quit();
    });

})().catch(error => {
    console.error(error);
});
