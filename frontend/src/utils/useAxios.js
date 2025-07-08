import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { useContext } from 'react';
import AuthContext from '../AuthContext.js';

const useAxios = () => {
    const { tokens, setUser, setTokens } = useContext(AuthContext);
    const baseURL = 'http://127.0.0.1:8000';
    let refreshAttempted = false; // Prevent infinite refresh loop

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${tokens?.access}` }
    });

    axiosInstance.interceptors.request.use(async req => {
        if (!tokens) {
            console.warn('No tokens. Skipping request.');
            return req;
        }
        const user = jwtDecode(tokens.access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req;

        if (refreshAttempted) {
            console.error('Refresh already attempted. Skipping further retries.');
            return req;
        }
        refreshAttempted = true;

        try {
            console.log('Attempting token refresh in useAxios...');
            const response = await axios.post(`${baseURL}/api/accounts/token/refresh/`, {
                refresh: tokens.refresh
            });

            localStorage.setItem('tokens', JSON.stringify({ ...tokens, access: response.data.access }));
            setTokens(prev => ({ ...prev, access: response.data.access }));
            setUser(jwtDecode(response.data.access));
            req.headers.Authorization = `Bearer ${response.data.access}`;
            console.log('Token refreshed successfully in useAxios.');
        } catch (err) {
            console.error('Failed to refresh token in useAxios:', err);
        }

        return req;
    });

    return axiosInstance;
};

export default useAxios;
