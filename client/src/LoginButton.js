import React from 'react';
import { Button } from '@mui/material';

const LoginButton = () => (
    <Button
        variant="contained"
        color="primary"
        onClick={() => window.location = 'http://localhost:3001/login'}
        style={{ fontWeight: 'bold' }}
    >
        Log in with Spotify for the first user.
    </Button>
);

export default LoginButton;
