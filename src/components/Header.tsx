import './Header.css';
import { LogIn, LogOut, Plus, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import plFlag from '../assets/pl.png';
import gbFlag from '../assets/gb.png';
import { ReactComponent as Logo } from '../assets/logo.svg';

interface Props {
    authenticated: boolean;
    onLogout: () => void;
    onShowLogin: () => void;
    onShowUpload: () => void;
    onShowAddUser: () => void;
}

function Header({ authenticated, onLogout, onShowLogin, onShowUpload, onShowAddUser }: Props) {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className="header">
            <div className="header-branding">
                <Logo className="header-logo" />
                <div className="header-titles">
                    <div className="site-title">{t('header.title')}</div>
                    <div className="site-subtitle">{t('header.subtitle')}</div>
                </div>
            </div>

            <div className="header-buttons">
                <div className="language-switcher">
                    <img
                        src={plFlag}
                        alt="PL"
                        title="Polski"
                        onClick={() => changeLanguage('pl')}
                    />
                    <img
                        src={gbFlag}
                        alt="EN"
                        title="English"
                        onClick={() => changeLanguage('en')}
                    />
                </div>

                {authenticated ? (
                    <>
                        <button className="login-button" onClick={onShowUpload}>
                            <Plus size={16} style={{ marginRight: 6 }} />
                            {t('header.upload_angel')}
                        </button>
                        <button className="login-button" onClick={onShowAddUser}>
                            <UserPlus size={16} style={{ marginRight: 6 }} />
                            {t('header.new_user')}
                        </button>
                        <button className="login-button" onClick={onLogout}>
                            <LogOut size={16} style={{ marginRight: 6 }} />
                            {t('header.logout')}
                        </button>
                    </>
                ) : (
                    <button className="login-button" onClick={onShowLogin}>
                        <LogIn size={16} style={{ marginRight: 6 }} />
                        {t('header.login')}
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
