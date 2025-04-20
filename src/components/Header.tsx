import './Header.css';

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
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {authenticated ? (
                    <>
                        <button className="login-button" onClick={onShowUpload}>Dodaj</button>
                        <button className="login-button" onClick={onShowAddUser}>Nowy użytkownik</button>
                        <button className="login-button" onClick={onLogout}>Wyloguj</button>
                    </>
                ) : (
                    <button className="login-button" onClick={onShowLogin}>Zaloguj</button>
                )}
            </div>
        </header>
    );
}

export default Header;
