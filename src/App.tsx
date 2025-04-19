import './App.css';
import Header from './components/Header';
import Sidebar, { Filters } from './components/Sidebar';
import Gallery from './components/Gallery';
import { useState } from 'react';
import { isLoggedIn, clearToken } from './utils/auth';
import LoginForm from './components/LoginForm';
import UploadForm from './components/UploadForm';

function App() {
    const [filters, setFilters] = useState<Filters>({});
    const [authenticated, setAuthenticated] = useState<boolean>(isLoggedIn());
    const [showLogin, setShowLogin] = useState<boolean>(false);
    const [showUpload, setShowUpload] = useState<boolean>(false);

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
            />

            <main className="main">
                <Sidebar onChange={setFilters} />
                <Gallery filters={filters} />
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
        </div>
    );
}

export default App;
