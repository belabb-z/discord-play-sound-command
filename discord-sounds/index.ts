import Discord, { Message, VoiceChannel } from 'discord.js';
import config from './config';
import { defaults } from './sounds.json';

const client = new Discord.Client();

const MAX_SOUND_DURATION: number = config.maxSoundDuration ?? 5000;
client.login(config.discordToken).then((login) => {
    console.log('Logged in');
});

client.on('message', async (message: Message) => {
    try {
        if (message.guild == null) {
            return;
        }

        if (message.content.startsWith('/oparleur')) {
            const arg = message.content.split(' ')[1];

            if (arg === 'help' || arg === 'list') {
                const list: string[] = defaults.map((sound: { name: string; }) => sound.name).sort();
                message.reply(`usage: /oparleur <sound or URL>
List of preset sounds :
${list.join('\n')}`);
            } else if (message.member?.voice.channel != null) {
                await playSoundInChannel(message.member.voice.channel, arg);
                message.react('👍');
            } else {
                message.react('🔇');
                message.reply('you are not in a voice channel.');
            }
        }
    } catch (e) {
        message.react('☠️');
        message.reply('unexpected error: ' + e.message);
    }
});

async function playSoundInChannel(channel: VoiceChannel, sound: string = 'bonk') {
    const connection = await channel.join();
    const soundUri = getSoundUri(sound);
    const dispatcher = connection.play(soundUri);
    let hasFinished = false;

    dispatcher.on('error', (error) => {
        console.warn(error);
        dispatcher.destroy();
    });
    dispatcher.on('start', () => setTimeout(() => {
        if (hasFinished === false) {
            dispatcher.destroy();
            connection.disconnect();
        }
    }, MAX_SOUND_DURATION));
    dispatcher.on('finish', () => {
        hasFinished = true;
        connection.disconnect();
    });
}

function getSoundUri(soundName: string) {
    const sounds: { name: string, uri: string }[] = defaults;
    
    return sounds.find(sound => sound.name === soundName)?.uri ?? soundName;
}
