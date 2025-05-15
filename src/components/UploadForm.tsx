import { useEffect, useRef, useState } from 'react';
import './UploadForm.css';
import { getToken } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import { Palette, Hammer, Layers, Ruler, Camera } from 'lucide-react';

interface Props {
    onUploadSuccess: () => void;
    onClose: () => void;
}

function UploadForm({ onUploadSuccess, onClose }: Props) {
    const { t } = useTranslation();

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');
    const [type, setType] = useState('');
    const [height, setHeight] = useState('');
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
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError(t('upload.errors.noFile'));
            return;
        }

        const parsedHeight = parseFloat(height);
        if (!height || isNaN(parsedHeight) || parsedHeight <= 0) {
            setError(t('upload.errors.invalidHeight'));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append(
            'photo',
            new Blob(
                [JSON.stringify({ color, material, type, height: parsedHeight })],
                { type: 'application/json' }
            )
        );

        fetch(`${process.env.REACT_APP_API_URL}/api/photos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()!}` },
            body: formData,
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(t('upload.errors.uploadFailed'));
                return res.json();
            })
            .then(() => {
                onUploadSuccess();
                onClose();
            })
            .catch(err => setError(err.message));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            onClose();
        }
    };

    return (
        <div
            className="upload-modal-backdrop"
            ref={backdropRef}
            onMouseDown={handleMouseDown}
        >
            <form className="upload-modal upload-form-inner" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>{t('upload.title')}</h2>

                {previewUrl && (
                    <div className="image-preview">
                        <img src={previewUrl} alt="Preview" />
                    </div>
                )}

                {error && <p className="error">{error}</p>}

                <div className="upload-form-item tight">
                    <Camera size={20} />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                            const file = e.target.files?.[0] || null;
                            setFile(file);
                            setPreviewUrl(file ? URL.createObjectURL(file) : null);
                        }}
                    />
                </div>

                <div className="upload-form-item tight">
                    <Palette size={20} />
                    <input
                        list="colors"
                        placeholder={t('upload.color')}
                        value={color}
                        onChange={e => setColor(e.target.value)}
                    />
                </div>
                <datalist id="colors">
                    {colorOptions.map(option => <option key={option} value={option} />)}
                </datalist>

                <div className="upload-form-item tight">
                    <Hammer size={20} />
                    <input
                        list="materials"
                        placeholder={t('upload.material')}
                        value={material}
                        onChange={e => setMaterial(e.target.value)}
                    />
                </div>
                <datalist id="materials">
                    {materialOptions.map(option => <option key={option} value={option} />)}
                </datalist>

                <div className="upload-form-item tight">
                    <Layers size={20} />
                    <input
                        list="types"
                        placeholder={t('upload.type')}
                        value={type}
                        onChange={e => setType(e.target.value)}
                    />
                </div>
                <datalist id="types">
                    {typeOptions.map(option => <option key={option} value={option} />)}
                </datalist>

                <div className="upload-form-item tight">
                    <Ruler size={20} />
                    <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        max="1000000"
                        placeholder={t('upload.height')}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'e' || e.key === 'E') {
                                e.preventDefault(); // 🔒 blokada notacji naukowej
                            }
                        }}
                    />

                </div>

                <div className="upload-form-buttons">
                    <button type="submit">{t('upload.submit')}</button>
                    <button type="button" onClick={onClose}>{t('upload.cancel')}</button>
                </div>
            </form>
        </div>
    );
}

export default UploadForm;
