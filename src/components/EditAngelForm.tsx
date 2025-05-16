import { useEffect, useRef, useState } from 'react';
import { Angel } from '../types';
import { getToken } from '../utils/auth';
import './EditAngelForm.css';
import { useTranslation } from 'react-i18next';
import { Palette, Hammer, Layers, Ruler } from 'lucide-react';

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
    const [height, setHeight] = useState(angel.height.toString()); // zmiana: string
    const [error, setError] = useState<string | null>(null);

    const [colorOptions, setColorOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);
    const [materialOptions, setMaterialOptions] = useState<string[]>([]);

    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/colors`).then(res => res.json()).then(setColorOptions);
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/types`).then(res => res.json()).then(setTypeOptions);
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/materials`).then(res => res.json()).then(setMaterialOptions);
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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            onClose();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsedHeight = parseFloat(height);
        if (!height || isNaN(parsedHeight) || parsedHeight <= 0) {
            setError(t('editAngel.errors.invalidHeight'));
            return;
        }

        fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()!}`
            },
            body: JSON.stringify({ color, material, type, height: parsedHeight }),
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(t('editAngel.errors.upload'));
                return res.json();
            })
            .then(() => {
                onSave();
                onClose();
            })
            .catch(err => setError(err.message));
    };

    return (
        <div
            className="edit-modal-backdrop"
            ref={backdropRef}
            onMouseDown={handleMouseDown}
        >
            <form className="edit-modal edit-angel-form-inner" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>{t('editAngel.title')}</h2>
                {error && <p className="error">{error}</p>}

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
                    {colorOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
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
                    {materialOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
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
                    {typeOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
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
                        onChange={(e) => {
                            const value = e.target.value;
                            setHeight(value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'e' || e.key === 'E') {
                                e.preventDefault(); // blokuje notację naukową
                            }
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
