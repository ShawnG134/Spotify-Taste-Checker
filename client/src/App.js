import React, {useState, useEffect} from 'react';
import axios from 'axios';
import LoginButton from './LoginButton';
import TracksComponent from "./TracksComponent";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
    const [userdata, setUserdata] = useState({accessToken: null, userId: null});
    const [userIds, setUserIds] = useState([]);
    const [redirectInitiated, setRedirectInitiated] = useState(false);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code && !redirectInitiated) {
            axios.post('http://localhost:3001/callback', { code })
                .then(async res => {
                    const newData = {accessToken: res.data.accessToken, userId: res.data.userId};
                    if (!userdata.accessToken) {
                        setUserdata(newData);
                        fetchAndStoreTracks(newData);
                        // Set the flag before redirection
                        setRedirectInitiated(true);
                        // this is to wait for the results to be fetch before redirecting to main page.
                        await new Promise(r => setTimeout(r, 2000));
                        window.location.href = "http://localhost:3000";
                    }
                })
                .catch(err => console.error('Error in token exchange:', err));
        }
        fetchUserIds()
    }, [userdata.accessToken]);// Dependency to re-run the effect if accessToken changes

    const fetchUserIds = async () => {
        try {
            const response = await axios.get('http://localhost:3001/user-ids');
            setUserIds(response.data); // Update state with fetched user IDs.
        } catch (err) {
            console.error('Error fetching user IDs:', err);
        }
    }
    const fetchAndStoreTracks = async ({accessToken, userId}) => {
        if (!accessToken || !userId) return;
        try {
            const {data} = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50', {
                headers: {Authorization: `Bearer ${accessToken}`}
            });
            const tracksToStore = data.items.map(track => ({
                name: track.name,
                artists: track.artists.map(artist => artist.name) // Collect all artist names
            }));
            console.log(tracksToStore);
            await axios.post('http://localhost:3001/store-tracks', {tracks: tracksToStore, userId});
        } catch (err) {
            console.error('Error fetching and sending tracks:', err);
        }
    };

    return (
        <div className="App">
            {userIds.length === 2 ? (
                <TracksComponent userData={userIds[0]} otherUserData={userIds[1]}/>
            ) : (
                <LoginButton length={userIds.length}/>
            )}
        </div>
    );
}

export default App;
