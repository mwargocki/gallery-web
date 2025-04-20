import './App.css';
import Header from './components/Header';
import Sidebar, { Filters } from './components/Sidebar';
import Gallery from './components/Gallery';
import { useState } from 'react';
import { isLoggedIn, clearToken } from './utils/auth';
import LoginForm from './components/LoginForm';
import UploadForm from './components/UploadForm';
import AddUserForm from './components/AddUserForm';
import BackToTopButton from './components/BackToTopButton';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

function App() {
    const [authenticated, setAuthenticated] = useState<boolean>(isLoggedIn());
    const [showLogin, setShowLogin] = useState<boolean>(false);
    const [showUpload, setShowUpload] = useState<boolean>(false);
    const [showAddUser, setShowAddUser] = useState<boolean>(false);

    const location = useLocation();

    const [filters, setFilters] = useState<Filters>(() => {
        const params = new URLSearchParams(location.search);
        return {
            color: params.get('color') || undefined,
            type: params.get('type') || undefined,
            material: params.get('material') || undefined,
            minHeight: params.get('minHeight') ? parseInt(params.get('minHeight')!) : undefined,
            maxHeight: params.get('maxHeight') ? parseInt(params.get('maxHeight')!) : undefined,
        };
    });

    const handleLogout = () => {
        clearToken();
        setAuthenticated(false);
    };

    return (
        <div className="app">
            <Header
                authenticated={authenticated}
                onLogout={handleLogout}
                onShowLogin={() => setShowLogin(true)}
                onShowUpload={() => setShowUpload(true)}
                onShowAddUser={() => setShowAddUser(true)}
            />

            <main className="main">
                <Sidebar filters={filters} onChange={setFilters} />
                <div id="gallery-scroll" className="gallery-scroll">
                    <Routes>
                        <Route path="/" element={<Navigate to="/photos" />} />
                        <Route path="/photos" element={<Gallery filters={filters} />} />
                        <Route path="/photos/:photoId" element={<Gallery filters={filters} />} />
                    </Routes>
                </div>
            </main>

            {showLogin && !authenticated && (
                <LoginForm
                    onLoginSuccess={() => {
                        setAuthenticated(true);
                        setShowLogin(false);
                    }}
                    onClose={() => setShowLogin(false)}
                />
            )}

            {authenticated && showUpload && (
                <UploadForm
                    onUploadSuccess={() => window.location.reload()}
                    onClose={() => setShowUpload(false)}
                />
            )}

            {authenticated && showAddUser && (
                <AddUserForm onClose={() => setShowAddUser(false)} />
            )}

            <BackToTopButton />
        </div>
    );
}

export default App;
