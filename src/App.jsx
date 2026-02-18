import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DomainDetail from './pages/DomainDetail.jsx';

function App() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-950 bg-mesh flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-surface-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-950 bg-mesh">
            {isAuthenticated && <Navbar />}
            <main className={isAuthenticated ? 'pt-4' : ''}>
                <Routes>
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
                    />
                    <Route
                        path="/register"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/domain/:id"
                        element={
                            <ProtectedRoute>
                                <DomainDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
