import { useEffect, useState } from 'react';
import './LoginForm.css';
import { saveToken } from '../utils/auth';

interface Props {
    onLoginSuccess: () => void;
    onClose: () => void;
}

function LoginForm({ onLoginSuccess, onClose }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then(res => {
                if (!res.ok) throw new Error('Błędny login lub hasło');
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
                <h2>Zaloguj się</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit} className="login-form-inner">
                    <input
                        type="text"
                        placeholder="Login"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        autoFocus
                    />
                    <input type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit">Zaloguj</button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
