import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginButton from './LoginButton';
import TopTracks from './TopTracks';

function App() {
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            axios.post('http://localhost:3001/callback', { code })
                .then(res => setAccessToken(res.data.accessToken))
                .catch(err => console.error('Error in token exchange:', err));
        }
    }, []);

    return (
        <div className="App">
            {!accessToken ? <LoginButton /> : <TopTracks accessToken={accessToken} />}
        </div>
    );
}

export default App;
