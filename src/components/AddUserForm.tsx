import { useEffect, useRef, useState } from 'react';
import './AddUserForm.css';
import { getToken } from '../utils/auth';
import { useTranslation } from 'react-i18next';

interface Props {
    onClose: () => void;
}

function AddUserForm({ onClose }: Props) {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            onClose();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()!}`
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(t('addUser.error'));
                return res.json();
            })
            .then(() => {
                onClose();
            })
            .catch(err => setError(err.message));
    };

    return (
        <div
            className="add-user-modal-backdrop"
            ref={backdropRef}
            onMouseDown={handleMouseDown}
        >
            <form className="add-user-modal add-user-form-inner" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>{t('addUser.title')}</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="text"
                    placeholder={t('addUser.username')}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoFocus
                />
                <input
                    type="password"
                    placeholder={t('addUser.password')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <div className="add-user-form-buttons">
                    <button type="submit">{t('addUser.submit')}</button>
                    <button type="button" onClick={onClose}>{t('addUser.cancel')}</button>
                </div>
            </form>
        </div>
    );
}

export default AddUserForm;
