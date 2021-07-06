import { readFileSync } from 'fs';
let discordToken;
let maxSoundDuration;

try {
    const jsonConfig = JSON.parse(readFileSync('./discord-sounds/config.json', 'utf-8'));
    discordToken = jsonConfig?.discordToken;
    maxSoundDuration = jsonConfig?.maxSoundDuration;
} catch {}

const config = {
    discordToken: discordToken ?? process.env.DISCORD_TOKEN,
    maxSoundDuration: maxSoundDuration ?? parseInt(process.env.MAX_SOUND_DURATION!, 10)
};

export default config;
