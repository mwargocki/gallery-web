import { useEffect, useState } from 'react';
import { Photo } from '../types';
import { getToken } from '../utils/auth';
import './EditPhotoForm.css';
import { useTranslation } from 'react-i18next';

interface Props {
    photo: Photo;
    onClose: () => void;
    onSave: () => void;
}

function EditPhotoForm({ photo, onClose, onSave }: Props) {
    const { t } = useTranslation();

    const [color, setColor] = useState(photo.color);
    const [material, setMaterial] = useState(photo.material);
    const [type, setType] = useState(photo.type);
    const [height, setHeight] = useState(photo.height);
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
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()!}`
            },
            body: JSON.stringify({ color, material, type, height }),
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(t('editPhoto.error'));
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
                <h2>{t('editPhoto.title')}</h2>
                {error && <p className="error">{error}</p>}

                <input
                    list="colors"
                    placeholder={t('editPhoto.color')}
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
                <datalist id="colors">
                    {colorOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
                </datalist>

                <input
                    list="materials"
                    placeholder={t('editPhoto.material')}
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                />
                <datalist id="materials">
                    {materialOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
                </datalist>

                <input
                    list="types"
                    placeholder={t('editPhoto.type')}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                />
                <datalist id="types">
                    {typeOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
                </datalist>

                <input
                    type="number"
                    placeholder={t('editPhoto.height')}
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                />

                <div className="edit-photo-form-buttons">
                    <button type="submit">{t('editPhoto.save')}</button>
                    <button type="button" onClick={onClose}>{t('editPhoto.cancel')}</button>
                </div>
            </form>
        </div>
    );
}

export default EditPhotoForm;
