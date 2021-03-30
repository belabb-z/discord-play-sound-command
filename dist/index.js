"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("./config.json"));
const sounds_json_1 = require("./sounds.json");
const discord_js_1 = __importDefault(require("discord.js"));
const client = new discord_js_1.default.Client();
const MAX_SOUND_DURATION = (_a = config_json_1.default.maxSoundDuration) !== null && _a !== void 0 ? _a : 5000;
client.login(config_json_1.default.discordToken).then((login) => {
    console.log('Logged in');
});
client.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        if (message.guild == null) {
            return;
        }
        if (message.content.startsWith('/oparleur')) {
            const arg = message.content.split(' ')[1];
            if (arg === 'help' || arg === 'list') {
                const list = sounds_json_1.defaults.map((sound) => sound.name).sort();
                message.reply(`Usage: /oparleur <sound or URL>
List of preset sounds :
${list.join('\n')}`);
            }
            else if (((_b = message.member) === null || _b === void 0 ? void 0 : _b.voice.channel) != null) {
                yield playSoundInChannel(message.member.voice.channel, arg);
                message.react('👍');
            }
            else {
                message.react('🔇');
                message.reply('You are not in a voice channel.');
            }
        }
    }
    catch (e) {
        message.react('☠️');
        message.reply('Unexpected error: ' + e.message);
    }
}));
function playSoundInChannel(channel, sound = 'bonk') {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield channel.join();
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
    });
}
function getSoundUri(soundName) {
    var _a, _b;
    const sounds = sounds_json_1.defaults;
    return (_b = (_a = sounds.find(sound => sound.name === soundName)) === null || _a === void 0 ? void 0 : _a.uri) !== null && _b !== void 0 ? _b : soundName;
}
process.on('unhandledRejection', (error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map