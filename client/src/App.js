import React, {useState, useEffect} from 'react';
import axios from 'axios';
import LoginButton from './LoginButton';
import TopTracks from './TopTracks';
import TracksComponent from "./TracksComponent";



function App() {
    const [user1Data, setUser1Data] = useState({accessToken: null, userId: null});
    const [user2Data, setUser2Data] = useState({accessToken: null, userId: null});

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            axios.post('http://localhost:3001/callback', {code})
                .then(res => {
                    if (!user1Data.accessToken) {
                        setUser1Data({accessToken: res.data.accessToken, userId: res.data.userId});
                    } else {
                        setUser2Data({accessToken: res.data.accessToken, userId: res.data.userId});
                    }
                })
                .catch(err => console.error('Error in token exchange:', err));
        }
    }, [user1Data.accessToken]);  // Adding dependency to re-run the effect if accessToken changes

    return (
        <div className="App">
            {!user1Data.accessToken ? <LoginButton/> :
                <TopTracks accessToken={user1Data.accessToken} userId={user1Data.userId}/>}
            {user1Data.accessToken && !user2Data.accessToken ? <LoginButton/> : null}
            <TracksComponent userData={user1Data} otherUserData={user2Data}> </TracksComponent>
        </div>
    );
}

export default App;
