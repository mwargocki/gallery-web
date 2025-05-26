import { useEffect, useRef, useState } from 'react';
import { Angel } from '../types';
import { getToken } from '../utils/auth';
import './EditAngelForm.css';
import { useTranslation } from 'react-i18next';
import { Palette, Hammer, Layers, Ruler, Camera } from 'lucide-react';

interface Props {
    angel: Angel;
    onClose: () => void;
    onSave: () => void;
}

function EditAngelForm({ angel, onClose, onSave }: Props) {
    const { t } = useTranslation();

    const [color, setColor] = useState(angel.color);
    const [material, setMaterial] = useState(angel.material);
    const [type, setType] = useState(angel.type);
    const [height, setHeight] = useState(angel.height.toString());

    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [colorOptions, setColorOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);
    const [materialOptions, setMaterialOptions] = useState<string[]>([]);

    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/colors`).then(res => res.json()).then(setColorOptions);
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/types`).then(res => res.json()).then(setTypeOptions);
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/materials`).then(res => res.json()).then(setMaterialOptions);
        fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos`).then(res => res.json()).then(setExistingPhotos);
    }, [angel.id]);

    useEffect(() => {
        const urls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [newFiles]);

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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const parsedHeight = parseFloat(height);
        if (!height || isNaN(parsedHeight) || parsedHeight <= 0) {
            setError(t('editAngel.errors.invalidHeight'));
            return;
        }

        try {
            const token = getToken();

            // 1. Zapisz dane anioła
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token!}`
                },
                body: JSON.stringify({ color, material, type, height: parsedHeight }),
                credentials: 'include'
            });

            if (!response.ok) throw new Error(t('editAngel.errors.upload'));

            // 2. Wyślij nowe zdjęcia
            if (newFiles.length > 0) {
                const formData = new FormData();
                newFiles.forEach(file => formData.append('photos', file));

                const photoRes = await fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token!}` },
                    body: formData
                });

                if (!photoRes.ok) throw new Error(t('editAngel.errors.uploadPhotos'));
            }

            // 3. Usuń zdjęcia z serwera
            for (const filename of photosToDelete) {
                await fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos/${filename}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token!}` },
                    credentials: 'include'
                });
            }

            onSave();
            onClose();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="edit-modal-backdrop" ref={backdropRef} onMouseDown={handleMouseDown}>
            <form className="edit-modal edit-angel-form-inner" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>{t('editAngel.title')}</h2>

                <div className="edit-photos-preview">
                    {existingPhotos.map(filename => (
                        <div key={filename} className="edit-photo-thumb">
                            <img
                                src={`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos/${filename}/scaled`}
                                alt={filename}
                            />
                            <button
                                type="button"
                                className="delete-thumb"
                                onClick={() => {
                                    setPhotosToDelete(prev => [...prev, filename]);
                                    setExistingPhotos(prev => prev.filter(f => f !== filename));
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {previewUrls.map((url, i) => (
                        <div key={i} className="edit-photo-thumb">
                            <img src={url} alt={`new-${i}`} />
                            <button
                                type="button"
                                className="delete-thumb"
                                onClick={() => {
                                    const newList = [...newFiles];
                                    newList.splice(i, 1);
                                    setNewFiles(newList);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {error && <p className="error">{error}</p>}

                <div className="edit-form-item tight">
                    <Camera size={20} />
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => {
                            if (e.target.files) {
                                setNewFiles(Array.from(e.target.files));
                            }
                        }}
                    />
                </div>

                <div className="edit-form-item tight">
                    <Palette size={20} />
                    <input
                        list="colors"
                        placeholder={t('editAngel.color')}
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                </div>
                <datalist id="colors">
                    {colorOptions.map(option => <option key={option} value={option} />)}
                </datalist>

                <div className="edit-form-item tight">
                    <Hammer size={20} />
                    <input
                        list="materials"
                        placeholder={t('editAngel.material')}
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                    />
                </div>
                <datalist id="materials">
                    {materialOptions.map(option => <option key={option} value={option} />)}
                </datalist>

                <div className="edit-form-item tight">
                    <Layers size={20} />
                    <input
                        list="types"
                        placeholder={t('editAngel.type')}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    />
                </div>
                <datalist id="types">
                    {typeOptions.map(option => <option key={option} value={option} />)}
                </datalist>

                <div className="edit-form-item tight">
                    <Ruler size={20} />
                    <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        max="1000000"
                        placeholder={t('editAngel.height')}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'e' || e.key === 'E') e.preventDefault();
                        }}
                    />
                </div>

                <div className="edit-angel-form-buttons">
                    <button type="submit">{t('editAngel.save')}</button>
                    <button type="button" onClick={onClose}>{t('editAngel.cancel')}</button>
                </div>
            </form>
        </div>
    );
}

export default EditAngelForm;
