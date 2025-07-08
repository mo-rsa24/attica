import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { useContext } from 'react';
// Change this import from '../context/AuthContext'
import AuthContext from '../AuthContext.js';

const useAxios = () => {
    // This line will now work correctly
    const { tokens, setUser, setTokens } = useContext(AuthContext);
    const baseURL = 'http://127.0.0.1:8000';

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${tokens?.access}` }
    });

    axiosInstance.interceptors.request.use(async req => {
        if (!tokens) {
            return req;
        }
        const user = jwtDecode(tokens.access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req;

        const response = await axios.post(`${baseURL}/api/accounts/token/refresh/`, {
            refresh: tokens.refresh
        });

        localStorage.setItem('tokens', JSON.stringify({ ...tokens, access: response.data.access }));
        setTokens(prev => ({ ...prev, access: response.data.access }));
        setUser(jwtDecode(response.data.access));
        req.headers.Authorization = `Bearer ${response.data.access}`;
        return req;
    });

    return axiosInstance;
};

export default useAxios;