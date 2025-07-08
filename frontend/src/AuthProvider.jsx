// frontend/src/AuthProvider.jsx

import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode"; // Correctly imported as a named import
import { useNavigate } from 'react-router-dom';

// 1. Create the Context
const AuthContext = createContext();

// This is a custom hook that simplifies accessing the context
export const useAuth = () => {
    return useContext(AuthContext);
};

// 2. Create the AuthProvider Component
export const AuthProvider = ({ children }) => {
    // 3. State Management: Initialize state from localStorage
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(() =>
        localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null
    );
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 4. Login Function
    const loginUser = async (email, password) => {
        try {
            const response = await fetch('/api/accounts/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) { // Use response.ok for better status checking
                setAuthTokens(data);
                const decodedUser = jwtDecode(data.access);
                setUser(decodedUser);
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/'); // Redirect to homepage on successful login
            } else {
                // Provide more specific error feedback
                alert(data.detail || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login. Please try again.");
        }
    };

    // 5. Register Function (Example implementation)
    const registerUser = async (userData) => {
        try {
            const response = await fetch('/api/accounts/register/', { // Assuming this is your registration endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                // Directly log the user in after successful registration
                await loginUser(userData.email, userData.password);
            } else {
                const errorData = await response.json();
                // Extract and show specific error messages from the backend
                const errorMessage = Object.values(errorData).flat().join(' ');
                alert(errorMessage || 'Registration failed.');
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred during registration. Please try again.");
        }
    };


    // 6. Logout Function
    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login'); // Redirect to login page on logout
    };

    // 7. useEffect for Token Refresh Logic
    useEffect(() => {
        if (!authTokens) {
            setLoading(false);
            return;
        }

        const refreshToken = async () => {
            try {
                const response = await fetch('/api/accounts/token/refresh/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 'refresh': authTokens.refresh })
                });
                const data = await response.json();
                if (response.ok) {
                    setAuthTokens(data);
                    setUser(jwtDecode(data.access));
                    localStorage.setItem('authTokens', JSON.stringify(data));
                } else {
                    // If refresh fails, log the user out
                    logoutUser();
                }
            } catch (error) {
                console.error("Token refresh error:", error);
                logoutUser();
            }
        };

        // Set an interval to refresh the token before it expires
        // JWT access tokens typically last 5-15 minutes. Refreshing every 4 minutes is a safe bet.
        const fourMinutes = 1000 * 60 * 4;
        const interval = setInterval(refreshToken, fourMinutes);

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);

    }, [authTokens]);


    // 8. Context Data
    const contextData = {
        user,
        authTokens,
        loginUser,
        registerUser,
        logoutUser,
    };

    // 9. Render the Provider with Children
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};