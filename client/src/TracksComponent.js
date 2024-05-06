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
            if (response.data.length === 1 ) {
                throw new Error('There\'s only one user/no user');
            } else if (response.data.length  === 0) {
                throw new Error("There\'s no user logged in, please log in.")
            }
            return response.data;
        } catch (err) {
            setError(err.message);
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
                    artist: track.artist
                }))
            };
        } catch (err) {
            setError(`Failed to fetch tracks for user ${userId}`);
            console.log(err);
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

    let displayContent;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (Object.keys(userTracks).length > 0) {
        displayContent = Object.entries(userTracks).map(([userId, tracks]) => (
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
        ));
    } else {
        displayContent = <p>No tracks found.</p>;
    }

    return (
        <div>
            <h1>Top Tracks by User</h1>
            {displayContent}
        </div>
    );
}

export default TracksComponent;
