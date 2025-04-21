import { useEffect, useState } from 'react';
import './AddUserForm.css';
import { getToken } from '../utils/auth';

interface Props {
    onClose: () => void;
}

function AddUserForm({ onClose }: Props) {
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
                if (!res.ok) throw new Error('Nie udało się dodać użytkownika');
                return res.json();
            })
            .then(() => {
                onClose();
            })
            .catch(err => setError(err.message));
    };

    return (
        <div className="add-user-modal-backdrop" onClick={onClose}>
            <form className="add-user-modal add-user-form-inner" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>Dodaj użytkownika</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="text"
                    placeholder="Login"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoFocus
                />
                <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <div className="add-user-form-buttons">
                    <button type="submit">Dodaj</button>
                    <button type="button" onClick={onClose}>Anuluj</button>
                </div>
            </form>
        </div>
    );
}

export default AddUserForm;
