import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OpenAI from 'openai';
import './ComparisonStyles.css';

function TracksComponent() {
    const [userTracks, setUserTracks] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

    // Fetch user IDs from the backend
    const fetchUserIds = async () => {
        try {
            const url = 'http://localhost:3001/user-ids';
            const response = await axios.get(url);
            if (!response.data.length) throw new Error("No user logged in, please log in.");
            if (response.data.length === 1) throw new Error("Only one user found.");
            return response.data;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return [];  // Prevent further processing on error
        }
    };

    // Fetch tracks for a specific user
    const fetchTracks = async (userId) => {
        try {
            const url = `http://localhost:3001/get-tracks/${userId}`;
            const response = await axios.get(url);
            return {
                userId,
                tracks: response.data.map(track => ({
                    name: track.name,
                    artist: track.artist
                }))
            };
        } catch (err) {
            setError(`Failed to fetch tracks for user ${userId}`);
            return null;
        }
    };

    // Analyze musical tastes using ChatGPT
    const analyzeTastes = async (tracksData) => {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "Compare the musical tastes of these two users." },
                    { role: "user", content: JSON.stringify(tracksData) }
                ],
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
            // return "This is a test";
        } catch (err) {
            setError("Error analyzing music tastes with ChatGPT.");
            console.log(err);
            return "Error during analysis.";
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchUserIds().then(userIds => {
            Promise.all(userIds.map(userId => fetchTracks(userId)))
                .then(async results => {
                    const validResults = results.filter(result => result);
                    if (validResults.length > 1) {
                        analyzeTastes(validResults).then(analysis => {
                            setUserTracks({analysis, users: validResults});
                            setLoading(false);
                        });
                    } else {
                        // to wait until ChatGPT give response
                        await new Promise(r => setTimeout(r, 1000));
                        window.location.href = "http://localhost:3000";
                    }
                });
        });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="comparison-container">
            <h1>Music Taste Comparison</h1>
            <div className="content">
                <p>{userTracks.analysis || 'No comparison available.'}</p>
            </div>
        </div>
    );
}

export default TracksComponent;
