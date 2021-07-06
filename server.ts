import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('OK');
});

export default () => {
    app.listen(process.env.PORT);
}
