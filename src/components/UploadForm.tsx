import { useEffect, useState } from 'react';
import './UploadForm.css';
import { getToken } from '../utils/auth';

interface Props {
    onUploadSuccess: () => void;
    onClose: () => void;
}

function UploadForm({ onUploadSuccess, onClose }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');
    const [type, setType] = useState('');
    const [height, setHeight] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [colorOptions, setColorOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);
    const [materialOptions, setMaterialOptions] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/colors`)
            .then(res => res.json())
            .then(setColorOptions);

        fetch(`${process.env.REACT_APP_API_URL}/api/filters/types`)
            .then(res => res.json())
            .then(setTypeOptions);

        fetch(`${process.env.REACT_APP_API_URL}/api/filters/materials`)
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

        if (!file) {
            setError('Wybierz plik ze zdjęciem.');
            return;
        }

        if (!height || parseInt(height, 10) <= 0) {
            setError('Wysokość musi być większa niż 0.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append(
            'photo',
            new Blob(
                [JSON.stringify({
                    color,
                    material,
                    type,
                    height: parseInt(height, 10)
                })],
                { type: 'application/json' }
            )
        );

        fetch(`${process.env.REACT_APP_API_URL}/api/photos`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getToken()!}`
            },
            body: formData,
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Błąd podczas przesyłania zdjęcia');
                return res.json();
            })
            .then(() => {
                onUploadSuccess();
                onClose();
            })
            .catch(err => setError(err.message));
    };

    return (
        <div className="upload-modal-backdrop" onClick={onClose}>
            <form className="upload-modal upload-form-inner" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>Dodaj nowe zdjęcie</h2>
                {error && <p className="error">{error}</p>}

                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                />

                <input
                    list="colors"
                    placeholder="Kolor"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                />
                <datalist id="colors">
                    {colorOptions.map((option) => (
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
                    {materialOptions.map((option) => (
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
                    {typeOptions.map((option) => (
                        <option key={option} value={option} />
                    ))}
                </datalist>

                <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Wysokość (cm)"
                    value={height}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                            setHeight(value);
                        }
                    }}
                />

                <div className="upload-form-buttons">
                    <button type="submit">Dodaj</button>
                    <button type="button" onClick={onClose}>Anuluj</button>
                </div>
            </form>
        </div>
    );
}

export default UploadForm;
