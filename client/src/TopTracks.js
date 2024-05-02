import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as redis from "redis";

const redisClient = redis.createClient({
    url: 'redis://localhost:6379' // This should match your Redis server URL
});
redisClient.connect();

const TopTracks = ({ accessToken }) => {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        const fetchTopTracks = async () => {
            const { data } = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setTracks(data.items);
        };

        if (accessToken) {
            fetchTopTracks().catch(err => console.error('Error fetching top tracks:', err));
        }
    }, [accessToken]);

    return (
        <div>
            <h2>Top Played Songs</h2>
            <ul>
                {tracks.map((track, index) => (
                    <li key={index}>
                        {track.name} by {track.artists.map(artist => artist.name).join(", ")}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopTracks;
