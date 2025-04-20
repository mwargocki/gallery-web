import { useEffect, useState } from 'react';
import './EditPhotoForm.css';
import { Photo } from '../types';
import { getToken } from '../utils/auth';

interface Props {
    photo: Photo;
    onClose: () => void;
    onSave: () => void;
}

function EditPhotoForm({ photo, onClose, onSave }: Props) {
    const [color, setColor] = useState(photo.color);
    const [material, setMaterial] = useState(photo.material);
    const [type, setType] = useState(photo.type);
    const [height, setHeight] = useState(photo.height);
    const [error, setError] = useState<string | null>(null);

    const [colorOptions, setColorOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);
    const [materialOptions, setMaterialOptions] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/filters/colors')
            .then(res => res.json())
            .then(setColorOptions);

        fetch('http://localhost:8080/api/filters/types')
            .then(res => res.json())
            .then(setTypeOptions);

        fetch('http://localhost:8080/api/filters/materials')
            .then(res => res.json())
            .then(setMaterialOptions);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        fetch(`http://localhost:8080/api/photos/${photo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()!}`
            },
            body: JSON.stringify({ color, material, type, height }),
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Nie udało się zaktualizować zdjęcia');
                return res.json();
            })
            .then(() => {
                onSave();
                onClose();
            })
            .catch(err => setError(err.message));
    };

    return (
        <div className="edit-modal-backdrop" onClick={onClose}>
            <form className="edit-modal edit-photo-form-inner" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>Edytuj atrybuty</h2>
                {error && <p className="error">{error}</p>}

                <input
                    list="colors"
                    placeholder="Kolor"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                />
                <datalist id="colors">
                    {colorOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
                </datalist>

                <input
                    list="materials"
                    placeholder="Materiał"
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                />
                <datalist id="materials">
                    {materialOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
                </datalist>

                <input
                    list="types"
                    placeholder="Typ"
                    value={type}
                    onChange={e => setType(e.target.value)}
                />
                <datalist id="types">
                    {typeOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
                </datalist>

                <input
                    type="number"
                    placeholder="Wysokość (cm)"
                    value={height}
                    onChange={e => setHeight(parseInt(e.target.value))}
                />

                <div className="edit-photo-form-buttons">
                    <button type="submit">Zapisz</button>
                    <button type="button" onClick={onClose}>Anuluj</button>
                </div>
            </form>
        </div>
    );
}

export default EditPhotoForm;
