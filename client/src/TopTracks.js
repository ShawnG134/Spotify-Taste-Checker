import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopTracks = ({ accessToken, userId }) => {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        const fetchTopTracks = async () => {
            try {
                const { data } = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setTracks(data.items);
                const simplifiedData = data.items.map(track => ({
                    name: track.name,
                    artists: track.artists.map(artist => artist.name) // Collect all artist names
                }));
                console.log(simplifiedData);
                await storeTracksInRedis(simplifiedData);
            } catch (err) {
                console.error('Error fetching top tracks:', err);
            }
        };

        const storeTracksInRedis = async (tracks) => {
            try {
                await axios.post('http://localhost:3001/store-tracks', {
                    tracks,
                    userId
                });
            } catch (err) {
                console.error('Error sending tracks to Redis:', err);
            }
        };

        if (accessToken && userId) {
            fetchTopTracks();
        }
    }, [accessToken, userId]); // Dependency array includes userId

    return (
        []
    );
};

export default TopTracks;
