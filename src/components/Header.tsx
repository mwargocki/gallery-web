import './Header.css';
import { LogIn, LogOut, Plus, UserPlus } from 'lucide-react';

interface Props {
    authenticated: boolean;
    onLogout: () => void;
    onShowLogin: () => void;
    onShowUpload: () => void;
    onShowAddUser: () => void;
}

function Header({ authenticated, onLogout, onShowLogin, onShowUpload, onShowAddUser }: Props) {
    return (
        <header className="header">
            <h1>Galeria zdjęć</h1>
            <div className="header-buttons">
                {authenticated ? (
                    <>
                        <button className="login-button" onClick={onShowUpload}>
                            <Plus size={16} style={{ marginRight: 6 }} />
                            Dodaj
                        </button>
                        <button className="login-button" onClick={onShowAddUser}>
                            <UserPlus size={16} style={{ marginRight: 6 }} />
                            Nowy użytkownik
                        </button>
                        <button className="login-button" onClick={onLogout}>
                            <LogOut size={16} style={{ marginRight: 6 }} />
                            Wyloguj
                        </button>
                    </>
                ) : (
                    <button className="login-button" onClick={onShowLogin}>
                        <LogIn size={16} style={{ marginRight: 6 }} />
                        Zaloguj
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
