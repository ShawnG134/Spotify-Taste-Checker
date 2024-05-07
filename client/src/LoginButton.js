import React from 'react';
import {Button} from "react-bootstrap";

const LoginButton = ({ length }) => {
    const buttonText = length === 0 ? 'Log in with Spotify for the first user' : 'Continue login for the next user';
    const instructions = length === 1 ? 'Please change the user when logging in.' : '';

    return (
        <div>

            <Button
                variant="contained"
                color="primary"
                onClick={() => window.location = 'http://localhost:3001/login'}
                style={{fontWeight: 'bold'}}
            >
                {buttonText}
            </Button>
            <br/>
            {instructions}
        </div>
    );
};

export default LoginButton;
