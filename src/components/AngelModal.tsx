import { useEffect, useRef, useState } from 'react';
import './AngelModal.css';
import { Angel } from '../types';
import { isLoggedIn } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import { translateOrFallback } from '../utils/translateOrFallback';
import { Palette, Hammer, Layers, Ruler } from 'lucide-react';
import { formatHeight } from '../utils/formatHeight';

interface Props {
    angel: Angel;
    onClose: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    isEditing?: boolean;
    onPrev?: () => void;
    onNext?: () => void;
}

function AngelModal({ angel, onClose, onDelete, onEdit, isEditing = false, onPrev, onNext }: Props) {
    const { t } = useTranslation();
    const backdropRef = useRef<HTMLDivElement>(null);

    const [photos, setPhotos] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    let loadPhotos: () => void;
    loadPhotos = () => {
        fetch(`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos`)
            .then(res => res.json())
            .then(data => {
                setPhotos(data);
                setSelected(data[0] || null);
            });
    };

    useEffect(() => {
        loadPhotos();
    }, [angel.id, loadPhotos]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isEditing) onClose();
            else if (e.key === 'ArrowLeft' && onPrev && !isEditing) onPrev();
            else if (e.key === 'ArrowRight' && onNext && !isEditing) onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onPrev, onNext, isEditing]);

    useEffect(() => {
        const listener = () => loadPhotos();
        document.addEventListener('angelPhotosShouldRefresh', listener);
        return () => document.removeEventListener('angelPhotosShouldRefresh', listener);
    }, [loadPhotos]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    return (
        <div className="angel-modal-backdrop" ref={backdropRef} onMouseDown={handleMouseDown}>
            <div className="angel-modal" onClick={(e) => e.stopPropagation()}>
                {onPrev && (
                    <button className="nav-arrow left" onClick={onPrev}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                            <polyline points="15 18 9 12 15 6" stroke="black" fill="none" />
                        </svg>
                    </button>
                )}

                <div className="angel-modal-body">
                    <div className="angel-photo-main">
                        {selected && (
                            <img
                                src={`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos/${selected}/original`}
                                alt={`Anioł ${angel.id}`}
                            />
                        )}
                    </div>

                    <div className="angel-photo-side">
                        <div className="thumbnail-bar">
                            {photos.map((filename) => (
                                <img
                                    key={filename}
                                    src={`${process.env.REACT_APP_API_URL}/api/angels/${angel.id}/photos/${filename}/scaled`}
                                    className={filename === selected ? 'active' : ''}
                                    onClick={() => setSelected(filename)}
                                    alt={`thumb-${filename}`}
                                />
                            ))}
                        </div>

                        <div className="angel-details">
                            <p><strong>{t('angel.id')}:</strong> {angel.id}</p>
                            <p><Palette size={16} /> <strong>{t('angel.color')}:</strong> {translateOrFallback('color', angel.color)}</p>
                            <p><Layers size={16} /> <strong>{t('angel.type')}:</strong> {translateOrFallback('type', angel.type)}</p>
                            <p><Hammer size={16} /> <strong>{t('angel.material')}:</strong> {translateOrFallback('material', angel.material)}</p>
                            <p><Ruler size={16} /> <strong>{t('angel.height')}:</strong> {formatHeight(angel.height)} cm</p>
                            <p><strong>{t('angel.added')}:</strong> {new Date(angel.createdAt).toLocaleDateString('pl-PL')}</p>
                        </div>

                        <div className="modal-actions in-side">
                            {isLoggedIn() && onEdit && <button onClick={onEdit}>{t('angel.edit')}</button>}
                            {isLoggedIn() && onDelete && <button className="danger" onClick={onDelete}>{t('angel.delete')}</button>}
                            <button onClick={onClose}>{t('angel.close')}</button>
                        </div>
                    </div>
                </div>

                {onNext && (
                    <button className="nav-arrow right" onClick={onNext}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                            <polyline points="9 18 15 12 9 6" stroke="black" fill="none" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

export default AngelModal;
