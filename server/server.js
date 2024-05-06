require("dotenv").config()
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
// Clear Redis data on startup
redisClient.flushAll()
    .then(() => console.log('Redis data cleared on startup'))
    .catch(err => console.error('Failed to clear Redis on startup:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

const userIds = new Set();
// Redirect to Spotify login
app.get('/login', (req, res) => {
    const scopes = ['user-top-read', 'user-read-private'];
    // The third parameter (show dialog) is set to True is to enable other users to log in.
    res.redirect(spotifyApi.createAuthorizeURL(scopes, undefined, true));
});

// Spotify callback endpoint
app.post('/callback', async (req, res) => {
    const {code} = req.body;
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const {access_token} = data.body;
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"])
        // Retrieve user information from Spotify, this is to store two separate Users's info
        // in redis.
        const userInfo = await spotifyApi.getMe();
        const userId = userInfo.body.id; // Unique user identifier
        console.log(userId)
        console.log(userInfo)
        userIds.add(userId);
        // Respond with access token and user ID
        res.json({accessToken: access_token, userId: userId});
    } catch (err) {
        console.error('Error in Spotify authentication:', err);
        res.sendStatus(500);
    }
});

// Endpoint to store tracks in Redis
app.post('/store-tracks', async (req, res) => {
    const { tracks, userId } = req.body;
    try {
        const key = `user:${userId}:topTracks`;
        // Simplify tracks data before storing
        const simplifiedTracks = tracks.map(track => ({
            name: track.name,
            artist: track.artists.join(", ")
        }));
        await redisClient.set(key, JSON.stringify(simplifiedTracks));
        res.status(200).send('Tracks stored successfully');
    } catch (err) {
        console.error('Redis error:', err);
        res.status(500).send('Failed to store tracks');
    }
});

// Endpoint to store both users
app.post('/store-users', async (req, res) => {
    const {tracks, userId} = req.body;
    try {
        const key = `user:${userId}:topTracks`; // Unique key for each user
        await redisClient.set(key, JSON.stringify(tracks));
        res.status(200).send('Tracks stored successfully');
    } catch (err) {
        console.error('Redis error:', err);
        res.status(500).send('Failed to store tracks');
    }
});


// Endpoint to clear all data in Redis
app.post('/clear-redis', async (req, res) => {
    try {
        await redisClient.flushAll(); // This clears all data from all databases
        res.send('All data cleared successfully');
    } catch (err) {
        console.error('Failed to clear Redis:', err);
        res.status(500).send('Failed to clear data');
    }
});


// Endpoint to retrieve tracks from Redis
app.get('/get-tracks/:userId', async (req, res) => {
    const userId = req.params.userId;
    const key = `user:${userId}:topTracks`; // Construct the key used to store the user's tracks
    try {
        const tracksJson = await redisClient.get(key);
        if (tracksJson) {
            const tracks = JSON.parse(tracksJson);
            res.json(tracks);
        } else {
            res.status(404).send('No tracks found');
        }
    } catch (err) {
        console.error('Redis error:', err);
        res.status(500).send('Failed to retrieve tracks');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get('/user-ids', (req, res) => {
    // Convert the Set to an Array to send as JSON
    const userIdArray = Array.from(userIds);
    res.json(userIdArray);
});
