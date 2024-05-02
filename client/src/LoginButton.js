import React from 'react';

const LoginButton = () => (
    <button onClick={() => window.location = 'http://localhost:3001/login'}>
        Log in with Spotify
    </button>
);

export default LoginButton;
