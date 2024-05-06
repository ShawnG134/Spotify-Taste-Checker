import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DisplayTracks = ({ userId }) => {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/get-tracks/${userId}`);
                setTracks(response.data); // Assuming the data is directly the array of tracks
            } catch (err) {
                console.error('Failed to fetch tracks:', err);
            }
        };

        if (userId) {
            fetchTracks();
        }
    }, [userId]); // This effect depends on userId

    return (
        <div>
            <h2>User's Top Tracks</h2>
            <ul>
                {tracks.map((track, index) => (
                    <li key={index}>{track.name}</li> // Display each track's name
                ))}
            </ul>
        </div>
    );
};

export default DisplayTracks;
