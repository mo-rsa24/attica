import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import dayjs from 'dayjs';
import { useContext } from 'react';
// Change this import from '../context/AuthContext'
import AuthContext from '../AuthProvider';

const useAxios = () => {
    // This line will now work correctly
    const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);
    const baseURL = 'http://127.0.0.1:8000';

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${authTokens?.access}` }
    });

    axiosInstance.interceptors.request.use(async req => {
        if (!authTokens) {
            return req;
        }
        const user = jwtDecode(authTokens.access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req;

        const response = await axios.post(`${baseURL}/api/accounts/token/refresh/`, {
            refresh: authTokens.refresh
        });

        localStorage.setItem('authTokens', JSON.stringify(response.data));
        setAuthTokens(response.data);
        setUser(jwtDecode(response.data.access));
        req.headers.Authorization = `Bearer ${response.data.access}`;
        return req;
    });

    return axiosInstance;
};

export default useAxios;