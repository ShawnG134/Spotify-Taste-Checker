import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TracksComponent() {
    const [userTracks, setUserTracks] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch user IDs from the backend
    const fetchUserIds = async () => {
        try {
            const url = 'http://localhost:3001/user-ids';
            const response = await axios.get(url);
            return response.data;
        } catch (err) {
            setError('Failed to fetch user IDs');
            setLoading(false);
            return [];  // Return empty array on error to prevent further processing
        }
    };

    // Function to fetch tracks for a specific user
    const fetchTracks = async (userId) => {
        try {
            const url = `http://localhost:3001/get-tracks/${userId}`;
            const response = await axios.get(url);
            return {
                userId,
                tracks: response.data.map(track => ({
                    ...track,
                    artist: track.artists.map(artist => artist.name).join(', ')
                }))
            };
        } catch (err) {
            setError(`Failed to fetch tracks for user ${userId}`);
            return null;  // Return null on error to handle it gracefully
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchUserIds().then(userIds => {
            Promise.all(userIds.map(userId => fetchTracks(userId)))
                .then(results => {
                    setUserTracks(results.reduce((acc, result) => {
                        if (result) {  // Check if result is not null
                            acc[result.userId] = result.tracks;
                        }
                        return acc;
                    }, {}));
                    setLoading(false);
                });
        });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Top Tracks by User</h1>
            {Object.keys(userTracks).length > 0 ? (
                Object.entries(userTracks).map(([userId, tracks]) => (
                    <div key={userId}>
                        <h2>User: {userId}</h2>
                        <ul>
                            {tracks.map((track, index) => (
                                <li key={index}>
                                    {track.name} by {track.artist}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No tracks found.</p>
            )}
        </div>
    );
}

export default TracksComponent;
