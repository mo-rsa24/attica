// frontend/src/utils/useAxios.js

import axios from 'axios';
import jwt_decode from "jwt-decode";
import dayjs from 'dayjs';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const useAxios = () => {
    const { authTokens, setUser, setAuthTokens, baseURL } = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${authTokens?.access}` }
    });

    axiosInstance.interceptors.request.use(async req => {
        if (!authTokens) {
            // If no tokens, this is an unauthenticated request
            return req;
        }
        const user = jwt_decode(authTokens.access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req;

        const response = await axios.post(`${baseURL}/api/accounts/token/refresh/`, {
            refresh: authTokens.refresh
        });

        localStorage.setItem('authTokens', JSON.stringify(response.data));
        setAuthTokens(response.data);
        setUser(jwt_decode(response.data.access));
        req.headers.Authorization = `Bearer ${response.data.access}`;
        return req;
    });

    return axiosInstance;
};

export default useAxios;