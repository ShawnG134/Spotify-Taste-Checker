require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const redis = require('redis');

const app = express();
const port = 3001;

// Create a Redis client
const redisClient = redis.createClient({
    url: 'redis://localhost:6379' // Adjust this if your Redis configuration is different
});
redisClient.connect();

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
    const scopes = ['user-top-read', 'user-read-private'];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Spotify callback endpoint
app.post('/callback', async (req, res) => {
    const { code } = req.body;
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token } = data.body;
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"])
        res.json({ accessToken: access_token});
    } catch (err) {
        console.error('Error in Spotify authentication:', err);
        res.sendStatus(500);
    }
});

// Endpoint to store tracks in Redis
app.post('/store-tracks', async (req, res) => {
    const { tracks, userId } = req.body;
    try {
        const key = `user:${userId}:topTracks`; // Unique key for each user
        await redisClient.set(key, JSON.stringify(tracks));
        res.status(200).send('Tracks stored successfully');
    } catch (err) {
        console.error('Redis error:', err);
        res.status(500).send('Failed to store tracks');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
