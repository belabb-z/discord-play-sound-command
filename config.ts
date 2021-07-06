import { readFileSync } from "fs";
const jsonConfig = JSON.parse(readFileSync('./config.json', 'utf-8'));

const config = {
    discordToken: jsonConfig?.discordToken ?? process.env.DISCORD_TOKEN,
    maxSoundDuration: jsonConfig?.maxSoundDuration ?? parseInt(process.env.MAX_SOUND_DURATION!, 10)
};

export default config;
