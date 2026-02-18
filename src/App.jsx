import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DomainDetail from './pages/DomainDetail.jsx';

function App() {
    return (
        <div className="min-h-screen bg-surface-950 bg-mesh">
            <Navbar />
            <main className="pt-4">
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/domain/:id" element={<DomainDetail />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
