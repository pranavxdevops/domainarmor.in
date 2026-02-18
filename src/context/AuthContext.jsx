import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const register = async (email, password) => {
        const res = await api.post('/auth/register', { email, password });
        const { token: newToken, user: userData } = res.data.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
