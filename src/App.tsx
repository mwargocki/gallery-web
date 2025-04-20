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

function App() {
    const [filters, setFilters] = useState<Filters>({});
    const [authenticated, setAuthenticated] = useState<boolean>(isLoggedIn());
    const [showLogin, setShowLogin] = useState<boolean>(false);
    const [showUpload, setShowUpload] = useState<boolean>(false);
    const [showAddUser, setShowAddUser] = useState<boolean>(false);

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
                <Sidebar onChange={setFilters} />
                <div id="gallery-scroll" className="gallery-scroll">
                    <Gallery filters={filters} />
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
                <AddUserForm
                    onClose={() => setShowAddUser(false)}
                />
            )}

            <BackToTopButton />
        </div>
    );
}

export default App;
