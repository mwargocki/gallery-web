import { useEffect, useState } from 'react';
import './LoginForm.css';
import { saveToken } from '../utils/auth';
import { useTranslation } from 'react-i18next';

interface Props {
    onLoginSuccess: () => void;
    onClose: () => void;
}

function LoginForm({ onLoginSuccess, onClose }: Props) {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then(res => {
                if (!res.ok) throw new Error(t('login.invalid'));
                return res.json();
            })
            .then(data => {
                saveToken(data.token);
                onLoginSuccess();
            })
            .catch(err => setError(err.message));
    };

    return (
        <div className="login-modal-backdrop" onClick={onClose}>
            <div className="login-modal" onClick={e => e.stopPropagation()}>
                <h2>{t('login.title')}</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit} className="login-form-inner">
                    <input
                        type="text"
                        placeholder={t('login.username')}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        autoFocus
                    />
                    <input type="password" placeholder={t('login.password')} value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit">{t('login.submit')}</button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
