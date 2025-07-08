import { useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthContext from './AuthContext';

export function AuthProvider({ children }) {
    const [tokens, setTokens] = useState(() => {
        const stored = localStorage.getItem('tokens');
        return stored ? JSON.parse(stored) : null;
    });
    const [user, setUser] = useState(null);
    const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('currentRole') || null);
    const refreshing = useRef(false); // Prevent multiple refresh calls

    useEffect(() => {
        if (currentRole) {
            localStorage.setItem('currentRole', currentRole);
        }
    }, [currentRole]);

    const refreshToken = useCallback(async () => {
        if (!tokens?.refresh || refreshing.current) {
            console.warn('Refresh skipped: No refresh token or already refreshing.');
            return false;
        }
        refreshing.current = true;
        try {
            console.log('Attempting token refresh...');
            const res = await fetch('/api/accounts/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: tokens.refresh })
            });
            if (res.ok) {
                const data = await res.json();
                setTokens(prev => ({ ...prev, access: data.access }));
                localStorage.setItem('tokens', JSON.stringify({ ...tokens, access: data.access }));
                console.log('Token refresh succeeded.');
                return true;
            } else {
                console.error('Token refresh failed. Response not OK.');
                setTokens(null);
                return false;
            }
        } catch (err) {
            console.error('Token refresh error:', err);
            setTokens(null);
            return false;
        } finally {
            refreshing.current = false;
        }
    }, [tokens]);

    useEffect(() => {
        if (!tokens) {
            console.warn('No tokens found. Clearing user state.');
            setUser(null);
            localStorage.removeItem('tokens');
            return;
        }

        localStorage.setItem('tokens', JSON.stringify(tokens));
        const decoded = jwtDecode(tokens.access);
        const isExpired = decoded.exp * 1000 < Date.now();
        console.log('Token expired?', isExpired);

        const fetchUser = async () => {
            let tokenValid = true;
            if (isExpired) {
                tokenValid = await refreshToken();
            }
            if (tokenValid) {
                fetch('/api/accounts/me/', {
                    headers: { Authorization: `Bearer ${tokens.access}` }
                })
                    .then(res => (res.ok ? res.json() : null))
                    .then(data => {
                        if (data) {
                            setUser(data);
                            if (data?.roles?.length) {
                                setCurrentRole(prev => prev || data.roles[0]);
                            }
                            console.log('User fetched successfully.');
                        } else {
                            console.warn('Failed to fetch user. Response not OK.');
                            setUser(null);
                        }
                    })
                    .catch(err => {
                        console.error('Fetch user error:', err);
                        setUser(null);
                    });
            } else {
                console.warn('Token invalid after refresh. Logging out.');
                setUser(null);
            }
        };
        fetchUser();
    }, [tokens, refreshToken]);

    const login = async (username, password) => {
        const res = await fetch('/api/accounts/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            setTokens({ access: data.access, refresh: data.refresh });
            if (data.user) {
                setUser(data.user);
                if (data.user.roles?.length) {
                    setCurrentRole(data.user.roles[0]);
                }
            }
            return true;
        }
        return false;
    };

    const register = async (username, email, password, roles) => {
        const res = await fetch('/api/accounts/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, roles })
        });
        if (res.ok) {
            const data = await res.json();
            setTokens({ access: data.access, refresh: data.refresh });
            if (data.user) {
                setUser(data.user);
                if (data.user.roles?.length) {
                    setCurrentRole(data.user.roles[0]);
                }
            }
            return true;
        }
        return false;
    };

    const logout = () => {
        console.warn('Logging out user.');
        setTokens(null);
        setUser(null);
        setCurrentRole(null);
    };

    const contextValue = {
        user,
        tokens,
        login,
        register,
        logout,
        currentRole,
        setCurrentRole,
        setTokens,
        setUser
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
