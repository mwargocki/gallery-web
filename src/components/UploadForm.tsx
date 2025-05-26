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

    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
        if (!files.length) {
            setPreviewUrls([]);
            return;
        }

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);

        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [files]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!files.length) {
            setError(t('upload.errors.noFile'));
            return;
        }

        const parsedHeight = parseFloat(height);
        if (!height || isNaN(parsedHeight) || parsedHeight <= 0) {
            setError(t('upload.errors.invalidHeight'));
            return;
        }

        const formData = new FormData();
        formData.append(
            'angel',
            new Blob(
                [JSON.stringify({ color, material, type, height: parsedHeight })],
                { type: 'application/json' }
            )
        );

        files.forEach(file => formData.append('photos', file));

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/angels`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()!}` },
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) throw new Error(t('upload.errors.uploadFailed'));
            onUploadSuccess();
            onClose();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            setFiles(selected);
        }
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

                {previewUrls.length > 0 && (
                    <div className="image-preview">
                        {previewUrls.map((url, idx) => (
                            <img key={idx} src={url} alt={`Preview ${idx + 1}`} />
                        ))}
                    </div>
                )}

                {error && <p className="error">{error}</p>}

                <div className="upload-form-item tight">
                    <Camera size={20} />
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
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
                                e.preventDefault();
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
