require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const spotifyApi = new SpotifyWebApi({
    clientId: "5e48a213c83748dab5411b7c481d54dd",
    clientSecret: "d0f380c24c584f889650cb7953b2ceed",
    redirectUri: "http://localhost:3000",
});

// Redirect to Spotify login
app.get('/login', (req, res) => {
    const scopes = ['user-top-read'];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Callback endpoint for Spotify to redirect to
app.post('/callback', (req, res) => {
    const { code } = req.body;
    spotifyApi.authorizationCodeGrant(code)
        .then(data => {
            const { access_token } = data.body;
            res.json({ accessToken: access_token });
        })
        .catch(err => {
            console.error('Error getting Tokens:', err);
            res.sendStatus(500);
        });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
