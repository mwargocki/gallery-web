import './App.css';
import Header from './components/Header';
import Sidebar, { Filters } from './components/Sidebar';
import Gallery from './components/Gallery';
import { useState, useEffect } from 'react';
import { isLoggedIn, clearToken } from './utils/auth';
import LoginForm from './components/LoginForm';
import UploadForm from './components/UploadForm';
import AddUserForm from './components/AddUserForm';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function App() {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const updateTitle = () => {
            document.title = t('meta.title');
        };

        updateTitle();
        i18n.on('languageChanged', updateTitle);
        return () => {
            i18n.off('languageChanged', updateTitle);
        };
    }, [t, i18n]);

    const [authenticated, setAuthenticated] = useState<boolean>(isLoggedIn());
    const [showLogin, setShowLogin] = useState<boolean>(false);
    const [showUpload, setShowUpload] = useState<boolean>(false);
    const [showAddUser, setShowAddUser] = useState<boolean>(false);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [sidebarReloadKey, setSidebarReloadKey] = useState(0);

    const location = useLocation();

    const [filters, setFilters] = useState<Filters>(() => {
        const params = new URLSearchParams(location.search);
        return {
            color: params.get('color') || undefined,
            type: params.get('type') || undefined,
            material: params.get('material') || undefined,
            minHeight: params.get('minHeight') ? parseInt(params.get('minHeight')!) : undefined,
            maxHeight: params.get('maxHeight') ? parseInt(params.get('maxHeight')!) : undefined,
            sort: params.get('sort') || 'date_desc',
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
                <Sidebar
                    key={sidebarReloadKey}
                    filters={filters}
                    onChange={setFilters}
                    totalElements={totalElements}
                />
                <div id="gallery-scroll" className="gallery-scroll">
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/angels" />}
                        />
                        <Route
                            path="/angels"
                            element={
                                <Gallery
                                    filters={filters}
                                    setFilters={setFilters}
                                    setTotalElements={setTotalElements}
                                    triggerSidebarReload={() =>
                                        setSidebarReloadKey((prev) => prev + 1)
                                    }
                                />
                            }
                        />
                        <Route
                            path="/angels/:angelId"
                            element={
                                <Gallery
                                    filters={filters}
                                    setFilters={setFilters}
                                    setTotalElements={setTotalElements}
                                    triggerSidebarReload={() =>
                                        setSidebarReloadKey((prev) => prev + 1)
                                    }
                                />
                            }
                        />
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
            <Footer />
        </div>
    );
}

export default App;
