import http from 'http';
import server from './server';

import './discord-sounds';
import './twitch-clips';

server();

process.env.PORT && setInterval(() => {
    http.get('https://oparleur.herokuapp.com');
}, 1_500_000);

process.on('unhandledRejection', (error) => {
    console.error(error);
    process.exit(1);
});
