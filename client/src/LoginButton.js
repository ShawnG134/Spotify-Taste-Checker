// Import React and necessary Bootstrap components
import React from 'react';
import { Button } from "react-bootstrap";

// Define the LoginButton component with improved aesthetics
const LoginButton = ({ length }) => {
    // Determine button text based on user count
    const buttonText = length === 0 ? 'Log in with Spotify for the first user' : 'Continue login for the next user';
    // Display instructions only for the first subsequent user
    const instructions = length === 1 ? 'Please change the user when logging in.' : '';

    return (
        <div style={{ margin: '20px' }}>
            <Button
                variant="primary"
                style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    backgroundColor: '#1DB954', // Spotify's brand green color
                    borderColor: 'transparent',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // subtle shadow for depth
                    transition: 'background-color 0.2s, transform 0.2s' // smooth transitions
                }}
                onClick={() => window.location = 'http://localhost:3001/login'}
                onMouseOver={({ target }) => target.style.transform = 'scale(1.05)'} // scale button on hover for interactivity
                onMouseOut={({ target }) => target.style.transform = 'scale(1)'} // reset scale on mouse out
            >
                {buttonText}
            </Button>
            <br/>
            <div style={{ marginTop: '10px' }}>
                {instructions}
            </div>
        </div>
    );
};

// Export the improved LoginButton component
export default LoginButton;
